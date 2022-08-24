import React, {useRef} from 'react';
import axios from 'axios';
import Compressor from 'compressorjs';

const convertImageToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });


const UploadImage = (props) => {
    const { image: uploadImageIcon, imageServerUrl, sendImageUrl } = props;
    const fileRef = useRef(null);

    const handleFiles = (e) => {
    const fileList = e.target.files[0];
    // eslint-disable-next-line no-new
    return (
      fileList &&
      new Compressor(fileList, {
        quality: 0.2,
        maxWidth: 1024,
        maxHeight: 1024,
        convertTypes: [
          'image/png',
          'image/jpeg',
          'image/avif',
          'image/ico',
          'image/jpg',
          'image/jfif',
          'image/pjpeg',
          'image/pjp',
        ],
        convertSize: 1000000,
        checkOrientation: false,
        async success(result) {
          const imageBase64 = (await convertImageToBase64(result).then((data) => data)) ;
          const filterBase64 = imageBase64.split(',')[1];
          await axios({
              headers: { 'Content-Type': 'text/plain' },
              method: 'post',
              url: imageServerUrl,
              data: filterBase64,
          })
              .then(res => {
                // send result to rasa-server
                sendImageUrl(res.data);
              })
              .catch(error => {
                  console.log(error);
              });
        },
        error(err) {
          console.log('minify error', err);
        },
      })
    );
  };
    return (
        <>
            <input
                ref={fileRef}
                type="file"
                id="imageUploadInput"
                accept="image/*"
                multiple
                onClick={e => {
                    e.currentTarget.value = '';
                }}
                onChange={handleFiles.bind(this)}
                style={{display: "none"}}
            />
            <button
                type="button"
                onClick={() => {
                    if (fileRef.current) fileRef.current.click();
                }}
            >
                <img
                    alt="upload icon"
                    aria-label="upload icon"
                    src={uploadImageIcon}
                    width="20"
                    height="20"
                />
            </button>
        </>
    );
};

export default UploadImage;