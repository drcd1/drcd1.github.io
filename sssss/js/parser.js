async function parse_mesh(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.log("Unable to parse");
    }
    const blob = await response.blob();

    let v = 0;
    let f = 0;

    let n_props = 0;

    const buffer = await blob.arrayBuffer();

    const view = new DataView(buffer);
    let off = 0
    v = view.getUint32(off, true);
    off += 4;
    f = view.getUint32(off, true);
    off += 4;
    n_props = view.getUint32(off, true);
    off += 4;
    console.log(v, f, n_props);

    let props = [];

    for (let i = 0; i < n_props; i++) {
        props.push(String.fromCharCode(view.getUint8(off, true)));
        off += 1;
    }
    console.log(props);
    let verts = [];
    let normals = [];
    let uvs = [];
    let tangents = [];
    let idx = [];

    for (let i = 0; i < v; i++) {
        verts.push([
            view.getFloat32(off, true),
            view.getFloat32(off + 4, true),
            view.getFloat32(off + 8, true)]);
        off += 4 * 3;
        normals.push([
            view.getFloat32(off, true),
            view.getFloat32(off + 4, true),
            view.getFloat32(off + 8, true)]);
        off += 4 * 3;
        uvs.push([
            view.getFloat32(off, true),
            view.getFloat32(off + 4, true),
        ]);
        off += 4 * 2;
        tangents.push([
            view.getFloat32(off, true),
            view.getFloat32(off + 4, true),
            view.getFloat32(off + 8, true)]);
        off += 4 * 3;
    }
    for (let i = 0; i < f; i++) {
        idx.push([
            view.getUint32(off, true),
            view.getUint32(off + 4, true),
            view.getUint32(off + 8, true)]);
        off += 4 * 3;
    }

    return Mesh.create(verts, normals, uvs, tangents, idx);




}
