  const renderImage = (image) => {
    if (!image || !image.data) return null;

    const base64String = btoa(
      new Uint8Array(image.data.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    return `data:${image.contentType};base64,${base64String}`;
  };
  const ImageProcess = {
    renderImage
}
export default ImageProcess