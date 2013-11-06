var request = require('request');
var expect = require('chai').expect;

describe("Le serveur", function () {
    it("reçoit une string sur la route /postCode et l'exécute", function(done){
        request.post({url: 'http://localhost:8000/postCode', form: {code: "1+1"}}, function(err, req, body){
            expect(err).to.be.null;
            expect(body).to.be.a('string');
            expect(body).to.be.equal('2');
            done();
        }); 
    })
});
