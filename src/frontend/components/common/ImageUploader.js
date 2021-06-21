import React, { useState } from 'react'
import { Button } from 'reactstrap'
import { LoadingInline } from '../common'
import { injectIntl, FormattedMessage } from 'react-intl'
import ImageUploading from 'react-images-uploading'
import AWS from 'aws-sdk'
import variables from '../../variables'

const MAX_NUMBER = 1
const S3_BUCKET = variables.bucketS3Name
const S3_REGION = variables.bucketS3Region

AWS.config.update({
  accessKeyId: variables.cognitoAccessKey,
  secretAccessKey: variables.cognitoSecretKey
})

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: S3_REGION
})

const buttonFontSize = { fontSize: 0.8 + 'rem' }

const ImageUploader = (props) => {
  // Props and params
  const { id, disabled, onUploadSuccess, oldImage } = props

  // State
  const [images, setImages] = React.useState([])
  const [uploading, setUploading] = useState(false)

  // Button handlers
  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex)
    setImages(imageList)
  }

  const onUploadClick = () => {
    const fileToUpload = images[0]
    const { file } = fileToUpload
    const fileName = id + '_' + file.name.replace(' ', '_')

    const params = {
      ACL: 'public-read',
      Body: file,
      Bucket: S3_BUCKET,
      Key: fileName
    }

    const putObjectPromise = myBucket.putObject(params).promise()
    putObjectPromise
      .then(() => {
        if (oldImage) {
          try {
            const urlParts = oldImage.split('/')
            const oldFileName = urlParts[urlParts.length - 1]

            const deleteParams = { Bucket: S3_BUCKET, Key: oldFileName }
            const deleteObjectPromise = myBucket.deleteObject(deleteParams).promise()
            deleteObjectPromise
              .then(() => {
                console.log('deleteObject - success')
              })
          } catch {
            console.log('deleteObject - error')
          } finally {
            const fileUrl = `https://s3-${S3_REGION}.amazonaws.com/${S3_BUCKET}/${fileName}`
            onUploadSuccess(fileUrl)
          }
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setUploading(false)
      })
  }

  return (
    <div className='image-uploader'>
      <ImageUploading
        multiple={false}
        value={images}
        onChange={onChange}
        maxNumber={MAX_NUMBER}
        dataURLKey='data_url'
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps
        }) => (
          <div className='upload-image-wrapper'>
            <div className='row text-center ml-1 mr-1'>
              <div className='col-md-9 col-xs-12 pl-0 pr-0 border rounded'>
                {imageList.length === 0 && (
                  <div className='d-flex justify-content-center align-items-center bg-light text-muted h-100 disabled'>
                    <FormattedMessage id='no_image' />
                  </div>
                )}
                {imageList.map((image, index) => (
                  <div key={index} className='image-item'>
                    <img src={image.data_url} alt='' className='w-100' />
                    {/*
                    <div className='image-item__btn-wrapper'>
                      <button onClick={() => onImageUpdate(index)}>Update</button>
                      <button onClick={() => onImageRemove(index)}>Remove</button>
                    </div>
                    */}
                  </div>
                ))}
              </div>
              <div className='col-md-3 col-xs-12'>
                <div className='row text-center'>
                  <div className='col-md-12 col-xs-12'>
                    <Button
                      color='outline-secondary'
                      className='m-1'
                      style={buttonFontSize}
                      disabled={disabled || imageList.length !== 0 || uploading}
                      onClick={onImageUpload}
                      {...dragProps}
                    >
                      <FormattedMessage id='button.select_image' />
                    </Button>
                  </div>
                  <div className='col-md-12 col-xs-12'>
                    <Button
                      color='outline-danger'
                      className='m-1'
                      style={buttonFontSize}
                      disabled={disabled || uploading}
                      onClick={onImageRemoveAll}
                    >
                      <FormattedMessage id='button.remove_image' />
                    </Button>
                  </div>
                  <div className='col-md-12 col-xs-12'>
                    <Button
                      color='outline-success'
                      className='m-1'
                      style={buttonFontSize}
                      disabled={disabled || imageList.length === 0 || uploading}
                      onClick={onUploadClick}
                    >
                      <FormattedMessage id='button.upload_image' />
                      {uploading && <LoadingInline className='ml-3' />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ImageUploading>
    </div>
  )
}

export default injectIntl(ImageUploader)
