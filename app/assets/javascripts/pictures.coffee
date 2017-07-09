$ ->
  document.addEventListener 'trix-attachment-add', (event) ->
    attachment = event.attachment
    if attachment.file
      return sendFile(attachment)
    return

  document.addEventListener 'trix-attachment-remove', (event) ->
    attachment = event.attachment
    deleteFile attachment

  sendFile = (attachment) ->

    file = attachment.file
    form = new FormData
    form.append 'Content-Type', file.type
    form.append 'picture[image]', file
    xhr = new XMLHttpRequest
    xhr.open 'POST', '/pictures', true
    alert 'Мы в sendFile'

    xhr.upload.onprogress = (event) ->
      progress = event.loaded / event.total * 100
      attachment.setUploadProgress progress

    xhr.onload = ->
      response = JSON.parse(@responseText)
      attachment.setAttributes
        url: response.url
        picture_id: response.picture_id
        href: response.url
        alert 'Мы в sendFile222'

    xhr.send form

  deleteFile = (n) ->
    $.ajax
      type: 'DELETE'
      url: '/pictures/' + n.attachment.attributes.values.picture_id
      cache: false
      contentType: false
      processData: false

  return