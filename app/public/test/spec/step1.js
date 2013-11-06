describe("L'application", function () {
    it('affiche un champ de texte', function () {
        var textarea = $('textarea#jscode');
        expect(textarea).to.be.an.object;
        expect(textarea.length).to.be.ok;
        expect(textarea[0].tagName).to.equal('TEXTAREA');
    });
    it('affiche un bouton pour executer', function () {
        var button = $('#execute');
        expect(button).to.be.an.object;
        expect(button.length).to.be.above(0);
        expect(button[0].tagName).to.equal('BUTTON');
    });

    it('execute le code présent dans le champ lorsque l\'on clique le bouton', function () {
        var textarea = $('textarea#jscode');
        var button = $('#execute');

        var oldAlert = window.alert;
        var hasBeenCalled = false;
        var myTestFunction = function (param) {
            expect(param).to.equal(8);
            hasBeenCalled = true;
        };
        window.myTestFunction = myTestFunction;
        textarea.val('myTestFunction(8)');
        button.trigger('click');
        expect(hasBeenCalled).to.be.true;
    })
})
