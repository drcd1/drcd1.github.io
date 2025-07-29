struct VO{
    @builtin(position) pos: vec4f,
    @location(0) local_pos: vec4f
}

struct SSSInfo{
    samples: array<vec4f,6>,
    radius: f32
}

@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var diff: texture_2d<f32>;
@group(0) @binding(2) var depth: texture_depth_2d;
@group(0) @binding(3) var<uniform> pass_dir: f32;

@group(1) @binding(0) var<uniform> sss_info: SSSInfo;
struct Globals {
        perspective: mat4x4f,
        view: mat4x4f,
        perspectiveInv: mat4x4f,
        viewInv: mat4x4f
    };

@group(2) @binding(0) var<uniform> globals: Globals;

@vertex fn vs(@builtin(vertex_index) vidx: u32)-> VO {
    let pos = array(
        vec2f(-1.0f,-1.0f),
        vec2f(3.0f,-1.0f),
        vec2f(-1.0f,3.0f)
    );

    var out: VO;

    out.pos = vec4f(pos[vidx],0.5f,1.0f);
    out.local_pos = out.pos;
    return out;

}


@fragment fn fs(in: VO) -> @location(0) vec4f {
    var col = textureLoad(diff, vec2i(in.pos.xy),0).rgb;
    var col3 = textureSample(diff,samp, in.pos.xy).rgb;
    col3.r += sss_info.radius;
    col3.r += globals.view[0][0];
    col3.r += textureLoad(depth,vec2i(0,0),0);
    col3.r += pass_dir;

    
    col = textureLoad(diff, vec2i(in.pos.xy),0).rgb;
    
    var w = sss_info.samples[0].xyz;
    var dir = vec2f(1.0f,0.0f);

    if(pass_dir>0.5f){
        dir = vec2f(0.0f,1.0f);
    }
    
    var uv = (in.pos.xy)/vec2f(textureDimensions(diff));
    
    var c_depth = textureLoad(depth, vec2i(in.pos.xy),0);
    var p = vec4f(uv*2.0-1.0,c_depth,1.0);
    p = globals.perspectiveInv*p; 
    p = p/p.w;
        
    //pixels
    var scale= sss_info.radius*f32(textureDimensions(diff).x)/(-p.z)*globals.perspective[0][0];
    var sum = col*w;
    for(var i=1; i<6; i++){
        var w1 = sss_info.samples[i].xyz;
        var d = sss_info.samples[i].w;
        
        var sgn = array(-1.0f,1.0f);

        for(var j = 0; j<2; j++){
            var new_pos = in.pos.xy+sgn[j]*d*dir*scale;
            var o_depth = textureLoad(depth, vec2i(new_pos),0);
            if(o_depth == 1.0f){
                continue;
            }
            var new_uv = new_pos/vec2f(textureDimensions(diff));
            var new_p = vec4f(new_uv*2.0-1.0,o_depth,1.0);
            new_p = globals.perspectiveInv*new_p;
            new_p = new_p/new_p.w;


            if(length(p-new_p)<sss_info.radius*10.0){
                sum +=w1*textureLoad(diff,vec2i(new_pos),0).rgb;
                w+=w1;
            }
        }

    }
    col = sum/w;
    //col= vec3f(fract(c_depth*100.99));





    return vec4f(col,1.0f); 
}
