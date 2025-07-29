struct VO{
    @builtin(position) pos: vec4f
}

@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var diff: texture_2d<f32>;
@group(0) @binding(2) var spec: texture_2d<f32>;

@vertex fn vs(@builtin(vertex_index) vidx: u32)-> VO {
    let pos = array(
        vec2f(-1.0f,-1.0f),
        vec2f(3.0f,-1.0f),
        vec2f(-1.0f,3.0f)
    );

    var out: VO;

    out.pos = vec4f(pos[vidx],0.5f,1.0f);
    return out;

}
fn toSrgb1(a: f32) -> f32 {
    if(a<=0.0031308){
        return 12.82f*a;
    } else {
        return (1.055f)*pow(a,1.0f/2.4f)-0.055;
    }
}
fn toSrgb(a: vec3f)->vec3f{
    return vec3f(toSrgb1(a.x),toSrgb1(a.y),toSrgb1(a.z));
}


@fragment fn fs(in: VO) -> @location(0) vec4f {
    var col = textureLoad(diff, vec2i(in.pos.xy),0).rgb;
    var col2 = textureLoad(spec, vec2i(in.pos.xy),0).rgb;
    var col3 = textureSample(spec,samp, in.pos.xy).rgb;

    
    col = col +col2;
    col = toSrgb(col);

    return vec4f(col+col3*0.001f,1.0f); 
}
