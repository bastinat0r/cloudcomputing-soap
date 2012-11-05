var http = require("http");
var util = require("util");
var url = require("url");


var wsdl = "";
var soapAction = "";
var soapOpts = {};
http.get("http://azuremd2.cloudapp.net/Service1.svc?wsdl", function(res) {
	res.on('data', function(data) {
		wsdl = wsdl + data;
	});
	res.on('end', function() {
		util.puts(wsdl.replace(/>/g,'>\n'));
		var soapAdress = "" + /soap:address location=\"[^\"]*/.exec(wsdl);
		soapAdress = soapAdress.replace("soap:address location=\"",'');
		soapAction = "" + /soapAction=\"[^\"]*/.exec(wsdl);
		soapAction = soapAction.replace("soapAction=\"",'');
		util.puts(soapAction);
		soapOpts = url.parse(soapAdress);
		soapOpts.method = "POST";
		soapOpts.headers = {"Content-Type" : "text/xml", "SOAPAction" : soapAction};
		util.puts(JSON.stringify(soapOpts));
		});
});

var srv = http.createServer(function(req, res) {
	res.writeHead(200);
	var answer = "";
	var soapReq = http.request(soapOpts, function(soapRes) {
		util.puts(soapRes.statusCode);
		util.puts(JSON.stringify(soapRes.headers));
		soapRes.on('data', function(chunk) {
			res.writeHead(200, {"Content-Type" : "text/plain"});
			var response = "" + /<GetTheSecretPhraseResult>[^<]*/.exec("" + chunk);
			response = response.replace(/<GetTheSecretPhraseResult>/, '');
			res.end(response);
			util.puts(response);
		});
	});
	soapReq.write("<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"><s:Header><avada>kedavra</avada><password>geheim</password></s:Header><s:Body><GetTheSecretPhrase xmlns=\"http://tempuri.org/\"/></s:Body></s:Envelope>");
	soapReq.on('error', util.puts);
	soapReq.end();

});
srv.listen(8080);
