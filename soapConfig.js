var soapClient = {}
soapClient.wsdl = new Array();
soapClient.wsdl[1] = 'http://127.0.0.1:8080/is-bin/INTERSHOP.servlet/WFS/Axis2/PrimeTech-PrimeTechSpecials-Site/CatalogService?wsdl'; 
soapClient.wsdl[2] = 'http://127.0.0.1:8080/is-bin/INTERSHOP.servlet/WFS/Axis2/PrimeTech-PrimeTechSpecials-Site/ProductListService?wsdl';
soapClient.endpoint = 'CatalogServiceHttpSoap11Endpoint';


soapClient.requestStructure = 'Browse'
soapClient.services = new Array();
soapClient.services[1] = 'CatalogService';
soapClient.location = 'http://127.0.0.1:8080/is-bin/INTERSHOP.servlet/WFS/Axis2/PrimeTech-PrimeTechSpecials-Site/'
exports.client = soapClient;