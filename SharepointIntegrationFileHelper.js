({
	params : {
        host : 'https://tekclanvoicetest.sharepoint.com',
        folder : 'Voice%20Document',
        chunksize : 100000000,
        accesstoken : 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTBmZjEtY2UwMC0wMDAwMDAwMDAwMDAvdGVrY2xhbnZvaWNldGVzdC5zaGFyZXBvaW50LmNvbUA5NzcxZWUwNS03OTc1LTRmMjctOTUxNi1lZjI4MmFjMjc5YmMiLCJpc3MiOiIwMDAwMDAwMS0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDBAOTc3MWVlMDUtNzk3NS00ZjI3LTk1MTYtZWYyODJhYzI3OWJjIiwiaWF0IjoxNjEzNTY3ODAyLCJuYmYiOjE2MTM1Njc4MDIsImV4cCI6MTYxMzY1NDUwMiwiaWRlbnRpdHlwcm92aWRlciI6IjAwMDAwMDAxLTAwMDAtMDAwMC1jMDAwLTAwMDAwMDAwMDAwMEA5NzcxZWUwNS03OTc1LTRmMjctOTUxNi1lZjI4MmFjMjc5YmMiLCJuYW1laWQiOiJlZjA5MmRkNC02YjcyLTRhMGQtOTlmNi02ODFhMDZkMWUzMTNAOTc3MWVlMDUtNzk3NS00ZjI3LTk1MTYtZWYyODJhYzI3OWJjIiwib2lkIjoiZDVlNDlkYTAtMjIxMy00NjA3LTk2YjctMDQxYzQ3NDA1OTc2Iiwic3ViIjoiZDVlNDlkYTAtMjIxMy00NjA3LTk2YjctMDQxYzQ3NDA1OTc2IiwidHJ1c3RlZGZvcmRlbGVnYXRpb24iOiJmYWxzZSJ9.YZOM_dWmdijypeIdwC_Vp0P7o384hs5uTSGUpl1e4eJp8Ja1RRvqa-VZXbbPCS5JNuEWVqvVtbTGPpn0Cu_IEsh-JqhELjVFUxWhuGnJzW6e-S8MCFClX8jPWBL6o9JTDeWkRvV8AGiM-3Qv_qGL0JX4XeUMBbtin9RrOBVFCji2TK0cOhUpEGbaXGFedWKbvfTprVSGFIqAGFvhzZSBaB4bM2IaS95H67HkASIs7qrC9OLhCJG6dxAht7ttwxYlxSyYcy64k_saBlSHFBcTIefUIw7lE9Y4FS4md0x8CuAf-XMKMyR8szpZZhBey5YmgA6kTkt5qTZfvbCbz9ViJg'
    },
    initiateFileUpload : function(file, helper) {
        var fileName = file.name;
        var fileSize = file.size;
        var url = `${helper.params.host}/_api/web/GetFolderByServerRelativeUrl('${helper.params.folder}')/Files/add(url='${fileName}',overwrite=true)`;
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            console.log(this.readyState);
            console.log(this.responseXML);
            console.log(this.responseText);
            console.log(this.status);
            if (this.readyState === 4) {
                let offset = 0;
                // the total file size in bytes...
                let total = file.size;
                // 1MB Chunks as represented in bytes (if the file is less than a MB, seperate it into two chunks of 80% and 20% the size)...
                let length = helper.params.chunksize > total ? total * 0.8 : helper.params.chunksize;
                let chunks = [];
                while (offset < total) {
                    //if we are dealing with the final chunk, we need to know...
                    if (offset + length > total) {
                        length = total - offset;
                    }
                    
                    //work out the chunks that need to be processed and the associated REST method (start, continue or finish)
                    chunks.push({ offset, length, method: helper.getUploadMethod(offset, length, total) });
                    
                    offset += length;
                }
                
                //each chunk is worth a percentage of the total size of the file...
                const chunkPercentage = parseFloat(((total / chunks.length) / total)) * 100;
                
                if (chunks.length > 0) {
                    //the unique guid identifier to be used throughout the upload session
                    const id = helper.createGuid();
                    
                    //Start the upload - send the data to SP
                    helper.uploadFile(file, id, 'Voice%20Document', file.name, chunks, 0, 0, chunkPercentage, helper);
                }
                //reads in the file using the fileReader HTML5 API (as an ArrayBuffer) - readAsBinaryString is not available in IE!
            }
        };
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader('Authorization', 'Bearer '+helper.params.accesstoken);
        xhttp.setRequestHeader('accept', 'application/json;odata=verbose');
        xhttp.send();
    },
 	uploadFile: function(file, id, libraryPath, fileName, chunks, index, byteOffset, chunkPercentage, helper) {
        //we slice the file blob into the chunk we need to send in this request (byteOffset tells us the start position)
        let chunk = chunks[index];
        const data = helper.convertFileToBlobChunks(file, byteOffset, chunk, helper);
        console.log('chunked size', data.size);
            let offset = chunk.offset === 0 ? '' : ',fileOffset=' + byteOffset;
            let targetURL = '/'+libraryPath+'/'+fileName;
            let endpoint = `${helper.params.host}/_api/web/getfilebyserverrelativeurl('${targetURL}')/${chunk.method}(uploadId=guid'${id}'${offset})`;
            console.log('End Point', endpoint);
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
               // console.log(this.status);
                console.log(this.readyState);
                //console.log(this.responseXML);
                console.log(this.responseText);
                if (this.readyState === 4 ) {
                    const isFinished = index === chunks.length - 1;
        
                    if (!isFinished) {
                        console.log('response Text', JSON.parse(this.responseText));
                        //the response value is a string of JSON (ugly) which we need to consume to find the offset
                        const response = typeof this.responseText !== 'undefined' ? JSON.parse(this.responseText) : '';
                        
                        //depending on the position in the upload, the response string (JSON) can differ!
                        if (typeof response.d.StartUpload !== 'undefined') {
                            byteOffset = parseInt(response.d.StartUpload, 10);
                        } else if (typeof response.d.ContinueUpload !== 'undefined') {
                            byteOffset = parseInt(response.d.ContinueUpload, 10);
                        }
                        
                    }
                    
                    index += 1;
                    
                    const percentageComplete = isFinished ? 100 : Math.round((index * chunkPercentage));
                    console.log(percentageComplete + '%');
                    
                    //More chunks to process before the file is finished, continue
                    if (index < chunks.length) {
                        helper.uploadFile(file, id, libraryPath, fileName, chunks, index, byteOffset, chunkPercentage, helper);
                    } else {
                        //setLoaderMessage(false);
                    }
                }
            };
            xhttp.open("POST", endpoint, true);
            xhttp.setRequestHeader('Authorization', 'Bearer '+helper.params.accesstoken);
            xhttp.setRequestHeader('accept', 'application/json;odata=verbose');
            xhttp.setRequestHeader('Content-Type', 'application/octet-stream');
            //xhttp.sendAsBinary(data);
            xhttp.send(data);
    },
    getUploadMethod : function (offset, length, total) {
      if (offset + length + 1 > total) {
        return 'finishupload';
      } else if (offset === 0) {
        return 'startupload';
      } else if (offset < total) {
        return 'continueupload';
      }
      return null;
    },
    convertFileToBlobChunks : function (result, byteOffset, chunkInfo, helper) {
      let blobData = chunkInfo.method === 'finishupload' ? result.slice(byteOffset) : result.slice(byteOffset, byteOffset + chunkInfo.length);
      return blobData;
    },
    convertDataBinaryString : function(data) {
      console.log('convertDataBinaryString data', data);
      let fileData = '';
    
      let byteArray = new Uint8Array(data);
    
      for (var i = 0; i < byteArray.byteLength; i++) {
        fileData += String.fromCharCode(byteArray[i]);
      }
      return fileData;
    },
    createGuid : function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
          var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
          return v.toString(16);  
       });
    },
})