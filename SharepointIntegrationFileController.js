({
	handleFilesChange : function(component, event, helper) {
        var files = event.getSource().get("v.files");
        /*var fileSize = files[0].size;
        var fileName = files[0].name;
        var reader = new FileReader();
         var slice_size = 1000 * 1024;
		helper.uploadFile(0, reader, files[0], slice_size);*/
        helper.initiateFileUpload(files[0], helper);
	}
})