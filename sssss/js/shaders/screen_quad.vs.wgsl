struct vo {
    @builtin(position) pos: vec4f,
    @location(0) uv: vec2f
};


@group(0) @binding(0) var samp: sampler;
@group(0) @binding(1) var quad: texture_2d<f32>;


@vertex fn vs(@builtin(vertex_index) vidx: u32) -> vo{
    let pos = array(
    vec2f(-1.0,-1.0),
    vec2f(3.0,-1.0),
    vec2f(-1.0,3.0)
    );

    var out: vo;
    out.pos = vec4f(pos[vidx], 0.0,1.0);
    out.uv = out.pos.xy*0.5+0.5;
    return out;
}
