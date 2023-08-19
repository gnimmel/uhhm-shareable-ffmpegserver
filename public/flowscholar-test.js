window.onload = function() {
    fetch('http://192.168.68.137:4000/get-sketch-by-id?id=123456')
        .then(response => response.text())
        .then(data => {
            let iframe = document.getElementById('content-frame');
            let doc = iframe.contentWindow.document;
            doc.open();
            doc.write(data);
            doc.close();
        })
        .catch(error => console.error('Error:', error));
};
