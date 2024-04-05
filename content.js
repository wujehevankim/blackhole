function addCss(fileName) {

    var head = document.head;
    var link = document.createElement("link");
  
    
    link.rel = "stylesheet";
    link.href = fileName;
  
    head.appendChild(link);
  }
  
  addCss('main.css');