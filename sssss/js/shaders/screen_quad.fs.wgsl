struct vo {
    @builtin(position) pos: vec4f,
    @location(0) uv: vec2f
};

//@group(0) @binding(0) var samp: sampler;
@group(0) @binding(0) var quad: texture_depth_2d;
@fragment fn fs(in:vo) -> @location(0) vec4f {
    var res = textureDimensions(quad);
    var uv = in.uv;
    uv.y = 1.0-uv.y;
    var col = textureLoad(quad,vec2i(uv*vec2f(res)),0);
   //// var col = textureSample(quad,in.pos.xy);
    return vec4f(vec3(fract(col*10.0f)),1.0);
}
