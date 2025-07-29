struct vo {
        @builtin(position) pos: vec4f,
        @location(0) local_pos: vec3f,
        @location(1) normal: vec3f,
        @location(2) uv: vec2f,
        @location(3) tangent: vec3f,
    };
struct Globals {
        perspective: mat4x4f,
        view: mat4x4f,
        perspectiveInv: mat4x4f,
        viewInv: mat4x4f
    };
struct PerInstance {
        transform: mat4x4f,
    };
struct Vertex {
    @location(0) pos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) tangent: vec3f
};
@group(0) @binding(0) var<uniform> globals: Globals;
@group(0) @binding(1) var<storage,read> inst_vars: array<PerInstance>;

@group(1) @binding(1) var albedo: texture_2d<f32>;
@group(1) @binding(2) var bump_map: texture_2d<f32>;
@group(1) @binding(0) var samp: sampler;


struct DirLightInfo{
    col:vec4f,
    projection: mat4x4f,
    projection_inv: mat4x4f,
    view: mat4x4f,
    view_inv: mat4x4f
}

@group(2) @binding(0) var<uniform> lights: array<DirLightInfo,1>;
@group(2) @binding(1) var sm0: texture_depth_2d;


@vertex fn vs(vert: Vertex, @builtin(vertex_index) vidx: u32, @builtin(instance_index) idx: u32) -> vo {

    //let pos = array(
    // vec2f(0.0, 0.5f),
    // vec2f(-0.5, 0.5),
    // vec2f(0.5, -0.5)
    // );

    var out: vo;
    var p: vec3f;
    p = vert.pos;
    p = (inst_vars[idx].transform * vec4f(p, 1.0)).xyz;
    out.local_pos = p;
    out.normal = (inst_vars[idx].transform * vec4f(vert.normal,0.0f)).xyz;
    out.uv = vert.uv;
    out.tangent = vert.tangent;

    out.pos = globals.perspective * globals.view*vec4f(p, 1.0);

    return out;
}


/*fn fr() -> f32 {

}*/


fn compute_specular(wo: vec3f, wi: vec3f, n: vec3f) -> f32{
    var wh = normalize(wo+wi);
    return pow(dot(wh,n), 20.0f)*0.4;

    
    

   // return fr()*g(wo,wi)*d(wh)/(4.0*)

}

struct Light {
        direction: vec3f,
        color: vec3f,
    };

fn toSrgb1(a: f32) -> f32 {
    if(a<=0.0031308){
        return 12.82f*a;
    } else {
        return (1.055f)*pow(a,1.0f/2.4f)-0.055;
    }
}

fn sample_sm(coord: vec2f, res: vec2<u32>)->f32{
        var sm_c = coord;
        sm_c.y = -sm_c.y;
        sm_c = sm_c*0.5+0.5;
        var px = vec2i((sm_c)*vec2f(res));
        return textureLoad(sm0,px,0);

}

fn toSrgb(a: vec3f)->vec3f{
    return vec3f(toSrgb1(a.x),toSrgb1(a.y),toSrgb1(a.z));
}

struct FO{
    @location(0) diff: vec4f,
    @location(1) spec: vec4f
};

    @fragment fn fs(in: vo) -> FO {

    var screen_uv = vec2f(in.pos.x/1024.0f,in.pos.y/800.0f);

    var col: vec3f;
    col = normalize(in.normal) * 0.5 + 0.5;
    var albedo: vec3f = textureSample(albedo, samp, in.uv).xyz;
    col = vec3f(0.0, 0.0, 0.0);
        var co = vec3f(globals.viewInv[3].xyz);
        var wi = normalize(co-in.local_pos);
    var normal = normalize(in.normal);
    var bitangent = normalize(cross(normal, in.tangent));
    var tan = normalize(cross(bitangent, normal));
    var delta = vec2f(1.0 / 1024.0, 1.0 / 1024.0);
    var o = textureSample(bump_map, samp, in.uv).x;
    var ox = 0.0f;
    var oy = 0.0f;
    var ox1 = 0.0f;
    var oy1 = 0.0f;
    var i = 0;
    var dx = dpdx(in.uv);
    var dy = dpdx(in.uv);
    for (var i = 0; i < 3; i++) {
        ox = textureSampleGrad(bump_map, samp, in.uv + vec2f(delta.x, 0.0f), dx, dy).x;
        ox1 = textureSampleGrad(bump_map, samp, in.uv - vec2f(delta.x, 0.0f), dx, dy).x;
        oy = textureSampleGrad(bump_map, samp, in.uv + vec2f(0.0, delta.y), dx, dy).x;
        oy1 = textureSampleGrad(bump_map, samp, in.uv - vec2f(0.0, delta.y), dx, dy).x;
        delta = delta * 2.0f;
        if ox != o || oy != o {
            break;
        }
    }
    var s = 0.007f;
    var n = vec3f((ox1 - ox) * 0.5 * s / delta.x, (oy1 - oy) * 0.5 * s / delta.y, 1.0f);
    n = normalize(n);
    n = tan * n.x + bitangent * n.y + normal * n.z;
    col = albedo*0.05f;
    var col2 = vec3f(0.0f);
    var tmp: FO;
    tmp.diff = vec4f(0.0f,0.0f,0.0f,1.0f);
    tmp.spec = vec4f(0.0f,0.0f,0.0f,1.0f);
    for (var i = 0; i < 1; i++) {
        var dir =vec3f(lights[i].view[0][2], lights[i].view[1][2],lights[i].view[2][2]);
        var c = max(0.0f, dot(n, dir));
        var chit = max(0.0f, -dot(normal, dir));
        var p = vec4f(in.local_pos,1.0f);
        p = p + vec4f(n,0.0f)*0.001f;
        p =lights[i].projection*lights[i].view*p;
        p = vec4f(p.xyz/p.w,p.w);
        var a = 1.0f;
        var res = textureDimensions(sm0);

        var d = sample_sm(p.xy,res);

        var trans = vec3(0.0);
        if(p.z>d){
            a = 0.0f;
        }
        var new_p = vec4(in.local_pos-normal*0.001f,1.0f);
        new_p = lights[i].projection*lights[i].view*new_p;
        new_p = new_p/new_p.w;
        var new_d = sample_sm(new_p.xy,res);
        if(p.z>d  || true){
            var dist = abs(new_d-new_p.z)*200.0f;
            var consts = vec3f(1.0/0.8,1.0/0.2,1.0/0.1);
            trans = vec3(exp(-consts.x*dist), exp(-consts.y*dist), exp(-consts.z*dist))*chit*0.3;
        }

        var spec = vec3f(0.0f);

        if(c>0.0f){
            spec = lights[i].col.rgb * compute_specular(wi,dir, n);
        }



        var diffuse = albedo * lights[i].col.rgb * (vec3f(c*a) + trans);

        spec =   spec*a  ;
        tmp.diff += vec4f(diffuse,0.0);
        tmp.spec += vec4f(spec,0.0);
        
    }

        return tmp;
    /*
    var p=vec4f(0.0f);
    if((in.pos.x)>600.0f){
        p =vec4f(in.local_pos,1.0f);
        p = p/p.w;
    }else {
        var clip = screen_uv*2.0-1.0;
        clip.y = -clip.y;

          p = globals.viewInv*globals.perspectiveInv*vec4f(clip,in.pos.z,1.0);
        p=p/p.w;
        //p = vec4f(0.0f,0.0f,0.0f,1.0f);
        }*/
    //p = globals.viewInv*globals.perspectiveInv*vec4f(in.pos.xyz/in.pos.w,1.0f);
    //p = p/p.w;
    //col = fract(p.xyz*5.0f);
}

