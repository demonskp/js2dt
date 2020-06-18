
function propertyParser(node){
  if(!node) return {};

  return {};
}

function methodParser(node){
  return {};
}

function classParser(classNode){
  if(!classNode) return;
  const result = {
    start:classNode.start,
    end:classNode.end,
    name:classNode.id.name,
    propertys:[],
    methods:[]
  };

  const classbodyList = classNode.body.body;

  classbodyList.forEach((node)=>{
    switch (node.type) {
      case 'ClassProperty':
        result.propertys.push(propertyParser(node));
        break;
      case 'MethodDefinition':
        result.propertys.push(methodParser(node));
        break;
      default:
        break;
    }
  })
}
