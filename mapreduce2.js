//Data Set
(function() {
var tableau=[]; 
for (var i=1; i<1000;i++){
//derniere case du tableau designe centre et avant dernier poids barycentre
tableau.push([i,i+1,i+2,1,0]);};
return tableau})()


//Map function
(function()
{
//liste des centres choisis
var c = [[7,8,9],[1200,1400,1700],[100,154,12]];

var d = [];
var s = 0; 

//on affecte chaque point au centre qui est le plus proche
for (var i = 0; i < c.length; i++) {
      s = 0;
     for( var j =0; j < c[0].length; j++){
          s += Math.pow(a[j]-c[i][j],2);
      }
      d.push(s);
}          

//la dernière case du tableau designe le centre
a[a.length-1] = indexOf(Math.min.apply(null,d));


return a;
})()


//Reduce function
(function()
{
	//choix du du centre dont les coordonnes vont etre reduites
	var choix = 0;

	//on reduit les points affectes au meme centre en utilisant les poids des barycentres
    if( a[a.length-1]==choix && b[a.length-1]==choix){
		for( var j =0; j < (a.length-2); j++){
			a[j] =  a[a.length-2]/(a[a.length-2]+b[a.length-2])*a[j]+b[a.length-2]/(a[a.length-2]+b[a.length-2])*b[j];	
		}
		
		//associativite du barycentre
		a[a.length-2] = a[a.length-2] + b[a.length-2];
		
		return a;
    }
    else if( a[a.length-1]!=choix && b[a.length-1]==choix){
		return b;
    }
    else if( a[a.length-1]==choix && b[a.length-1]!=choix){
		return a;
    }
    else {
		return a;
    }	


})()