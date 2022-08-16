import React, { Component, useState } from 'react';

const Main = ({uploadVideo, captureFile, videos, changeVideo, currentTitle, currentHash}) => {

  const [videoTitle, setVideoTitle] = useState('')

  const handleCaptureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = async () => {
      const buffer = Buffer(reader.result)
      console.log(buffer)
      captureFile(buffer)
    }
  }

  return (
    <div className="container-fluid text-monospace">
    <br></br>
    &nbsp;
    <br></br>
      <div className="row">
        <div className="col-md-10">
          <div className="embed-responsive embed-responsive-16by9" style={{ maxHeight: '768px'}}>
            <video
                src={`https://ipfs.io/ipfs/${currentHash}`}
                controls
            >
            </video>
          </div>
          <h3><b><i>{currentTitle}</i></b></h3>
        </div>
        <div className="col-md-2 overflow-auto text-center" style={{ maxHeight: '768px', minWidth: '175px' }}>
          <h5><b>{/* Share Video */}</b></h5>
          <form onSubmit={(event) => {
            event.preventDefault()
            uploadVideo(videoTitle.value)
          }} >
          &nbsp;
            <input type='file' accept=".mp4, .mkv .ogg .wmv" onChange={handleCaptureFile} style={{ width: '250px' }} />
              <div className="form-group mr-sm-2">
                <input
                  id="videoTitle"
                  type="text"
                  ref={(input) => { setVideoTitle(input) }}
                  className="form-control-sm"
                  placeholder="Title..."
                  required />
              </div>
            <button type="submit" className="btn btn-danger btn-block btn-sm">Upload!</button>
            &nbsp;
          </form>
          { videos.map((video, key) => {
              return(
                <div className="card mb-4 text-center bg-secondary mx-auto" style={{ width: '175px'}} key={key} >
                  <div className="card-title bg-dark">
                    <small className="text-white"><b>{video.title}</b></small>
                  </div>
                  <div>
                    <p onClick={() => changeVideo(video.hash, video.title)}>
                      <video
                        src={`https://ipfs.io/ipfs/${video.hash}`}
                        style={{ width: '150px' }}
                      />
                    </p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  );
}

export default Main;