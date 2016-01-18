/**
 * @author juan.garzon 2013-JUN-20
 * @Mod juan.garzon 2013-JUL-20		
 */
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var datos_pendientes;
var ttal_fotos;
var ttal_videos;
var ttal_formularios;
var ttal_respuestas;
var refreshIntervalId;

function errorCB_items(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>No hay Items para sincronizar.<br>");
	}else
	{
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);		
	}
}
function errorCB_Fotos(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar las fotografias<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	}
	
}
function errorCB_Videos(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar los Videos<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	}
	
}
function errorCB_Asignacion(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar los cuestionarios<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);		
	}
}
function errorCB_Respuestas(err) {
	if (err.code === undefined || err.message === undefined){
		$("#resultado").before("<br>Error al buscar las Respuestas<br>");
	}else
	{ 
		alert("Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message);		
	}
}

function ConsultaSincronizar(tx) {
	tx.executeSql('SELECT esquema FROM p_verticales order by esquema asc', [], ConsultaSincronizarCarga,errorCB_items);
}
function ConsultaSincronizarCarga(tx, results) {
	var ttal_ver = results.rows.length;	 //alert(len);
	for (cv = 0; cv < ttal_ver; cv++){
		var esquema = results.rows.item(cv).esquema;
		   tx.executeSql('SELECT "'+esquema+'" as esquema,id,id_feature,feature,id_encuestador,id_categoria,estado,id_usuario_asign,fecha_asignacion,fecha_ejecucion,latitud_envio,longitud_envio,exactitud,id_envio,geotabla,tipo_ingreso FROM '+esquema+'t_asignacion_lugar where estado = "C"', [], 
		   (function(esquema){
		       return function(tx,results){
		           ConsultaSincronizarAsignacion(tx,results,esquema);
		       };
		   })(esquema),errorCB_Asignacion);
   };

}


function ConsultaSincronizarAsignacion(tx, results, esquema) {
	var lon = results.rows.length;									//alert(lon);//$("#resultado").before("<br>Cuestionarios encontrados: "+len+".<br>");
	if(lon==0){
		tx.executeSql('SELECT "'+esquema+'" as esquema,id_asignacion,id_item,respuesta,id_envio FROM '+esquema+'t_rtas_formulario', [],
			   (function(esquema){
			       return function(tx,results){
			           ConsultaSincronizarRespuestas(tx,results,esquema);
			       };
			   })(esquema),errorCB_Respuestas);
	}else{
		for (i = 0; i < lon; i++){
			var parametros = new Object();
			var cod_envio = results.rows.item(i).id_envio;
			parametros['esquema'] = results.rows.item(i).esquema;
			parametros['tabla'] = 't_asignacion_lugar';
			parametros['id'] = results.rows.item(i).id;
			parametros['id_feature'] = results.rows.item(i).id_feature;
			parametros['feature'] = results.rows.item(i).feature;
			parametros['id_encuestador'] = results.rows.item(i).id_encuestador;
			parametros['id_categoria'] = results.rows.item(i).id_categoria;
			parametros['estado'] = results.rows.item(i).estado;
			parametros['id_usuario_asign'] = results.rows.item(i).id_usuario_asign;
			parametros['fecha_asignacion'] = results.rows.item(i).fecha_asignacion;
			parametros['fecha_ejecucion'] = results.rows.item(i).fecha_ejecucion;
			parametros['latitud_envio'] = results.rows.item(i).latitud_envio;
			parametros['longitud_envio'] = results.rows.item(i).longitud_envio;
			parametros['exactitud'] = results.rows.item(i).exactitud;
			parametros['id_envio'] = cod_envio;
			parametros['geotabla'] = results.rows.item(i).geotabla;
			parametros['tipo_ingreso'] = results.rows.item(i).tipo_ingreso;
			$("#resultado").html("<br>Formularios restantes: "+(lon-i)+".<br>");
			$("#resultado").trigger("create");
			$.ajax({
				data:  parametros,
				url:'http://'+localStorage.url_servidor+'/SIG/servicios/sincronizar.php',
				type:  'post',
				async: false,
				success: function(responsea){	//alert(responsea);
					db.transaction(function(tx) {
						var respa = responsea.trim();  
						var n=respa.split("@"); 
			          	tx.executeSql('DELETE from '+n[0]+'t_asignacion_lugar where id_envio = "'+n[1]+'"');
			        });
				},
				error: function (error) {
					console.log("Error en los cuestionarios");
					$("#resultado").text('Error en ingreso de Cuestionarios');
					alerta("GeoMovil","Error en el envío, verifique conectividad!","Ok","#");
			    }
			});
			if((i+1) == lon) { //alert("continue a rtas");
				tx.executeSql('SELECT "'+esquema+'" as esquema,id_asignacion,id_item,respuesta,id_envio FROM '+esquema+'t_rtas_formulario', [],
				   (function(esquema){
				       return function(tx,results){
				           ConsultaSincronizarRespuestas(tx,results,esquema);
				       };
				   })(esquema),errorCB_Respuestas);
			}
	   	}
	}
}

function ConsultaSincronizarRespuestas(tx, results, esquema) {
	var lon = results.rows.length;									//alert("Respuestas: "+lon);  //$("#resultado").before("<br>Cuestionarios encontrados: "+len+".<br>");
	if(lon==0){
	   tx.executeSql('SELECT "'+esquema+'" as esquema,id,url_foto,id_envio FROM '+esquema+'t_fotos', [], 
	   (function(esquema){
	       return function(tx,results){
	           ConsultaSincronizarFotos(tx,results,esquema);
	       };
	   })(esquema),errorCB_Fotos);
	}else{
		for (i = 0; i < lon; i++){
			var parametros = new Object();
			var cod_envio = results.rows.item(i).id_envio;
			parametros['esquema'] = results.rows.item(i).esquema;
			parametros['tabla'] = 't_rtas_formulario';
			parametros['id_asignacion'] = results.rows.item(i).id_asignacion;
			parametros['id_item'] = results.rows.item(i).id_item;
			parametros['respuesta'] = results.rows.item(i).respuesta;
			parametros['id_envio'] = results.rows.item(i).id_envio;
			$("#resultado").html("<br>Datos restantes: "+(ttal_respuestas-i)+".<br>");
			$("#resultado").trigger("create");
			$.ajax({
				data:  parametros,
				url:'http://'+localStorage.url_servidor+'/SIG/servicios/sincronizar.php',
				type:  'post',
				async: false,		//timeout: 30000,
				success: function(responser){	//alert(responser);
					db.transaction(function(tx) {
						var respr = responser.trim();		//alert(resp);
						var res=respr.split("@");			
			          	tx.executeSql('DELETE from '+res[0]+'t_rtas_formulario where id_envio = "'+res[1]+'" and id_item = "'+res[2]+'"');
					});
				},
				error: function (error) {
					$("#estado_envio").text('Verifique Conectividad');
			    }
			});
			if((i+1) == lon) {
				   tx.executeSql('SELECT "'+esquema+'" as esquema,id,url_foto,id_envio FROM '+esquema+'t_fotos', [], 
				   (function(esquema){
				       return function(tx,results){
				           ConsultaSincronizarFotos(tx,results,esquema);
				       };
				   })(esquema),errorCB_Fotos);
			}
	   	}
	}
}

//SINCRONIZAR FOTOS
function ConsultaSincronizarFotos(tx, results, esquema) {
	var len = results.rows.length;	//alert(len);
	if(len==0){
		tx.executeSql('SELECT "'+esquema+'" as esquema,id,url_video,id_envio FROM '+esquema+'t_video', [], 
		       (function(esquema){
		           return function(tx,results){
		               ConsultaSincronizarVideos(tx,results,esquema);
		           };
		       })(esquema),errorCB_Videos);
	}else{	//SELECT "'+esquema+'" as esquema,id,url_foto,id_envio FROM '+esquema+'t_fotos

		for (i = 0; i < len; i++){

		var url_imagen = results.rows.item(i).url_foto; //alert(url_imagen);
		var name = url_imagen.replace(/^.*[\\\/]/, '');
					
        var options_foto = new FileUploadOptions();
		options_foto.fileName=name;
		options_foto.chunkedMode = false;
		options_foto.headers = {Connection: "close"}; 
        options_foto.mimeType="image/jpeg";
            
          	var params_foto = new Object();
			params_foto.esquema = results.rows.item(i).esquema; //alert("Esquema: "+results.rows.item(i).esquema);
			params_foto.cod_envio = results.rows.item(i).id_envio;
			params_foto.rowid = results.rows.item(i).id;

        options_foto.params = params_foto;

			//ENVIA EL FOTO	
			var ft = new FileTransfer();
			ft.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
					$("#resultado").html("<br>Cargando: <strong>"+perc + "% </strong><br>"); 
				} 
				if(perc >= 99) $("#resultado").html('');
			};
			
	        ft.upload(url_imagen,
	            "http://"+localStorage.url_servidor+"/SIG/servicios/sincronizar_imagen.php",
	            function(result) {  $("#resultado").html("Response = " + result.response.toString());
	            	//RESPUESTA DEL SERVIDOR
					var respf = result.response.toString(); respf = respf.trim();
	            	var n=respf.split("@");

	            	//REMOVER ARCHIVO DEL DISPOSITIVO
	            	function eliminafotodb(tx) { //alert('DELETE from publicinventario_fotos where id_envio = "'+n[0]+'" and rowid = "'+n[1]+'"');
	            		tx.executeSql('DELETE from '+n[0]+'t_fotos where id_envio = "'+n[1]+'" and id = "'+n[2]+'"');
	            		$("#resultado").html('');
						//tx.executeSql('DELETE from publicinventario_fotos where id_envio = "'+n[0]+'" and rowid = "'+n[1]+'"');
					}
	            	function sqlexitoso ()  {
						//CONTINUA CON LOS NUEVOS ELEMENTOS REGISTRADOS EN EL SISTEMA
						if((i+1) == len) { //alert("continue a rtas");
							   	salir();
						} 
						//Delete file 
						window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, 
						    function(fileSys) { 
						
						        fileSys.root.getFile(n[2], {create: false}, 
						            function(file) {
						                file.remove(pictureRemoved, notRemoved);                                                  
						            }, no);
						    }, no); 
					}
					function sqlfallo(){}
					function pictureRemoved(){}
					function notRemoved(){ $("#resultado").html("<br> No se puede Eliminar el archivo, limpie el cache manualmente<br>"); }
					function no(error) { /*$("#resultado").html("<br> Ubicación incorrecta de la imagen<br>"+error);*/ }
	            	//ELIMINA DE LA BASE DE DATOS
	            	db.transaction(eliminafotodb,sqlfallo,sqlexitoso);

	            },
	            function(error) {
	                $("#resultado").html('Error cargando archivo, verifique conectividad: ' +error.code);
	                //alert("An error has occurred: source = " + error.source + error.code);
	                //alert("An error has occurred: target = " + error.target); 
						//CONTINUA CON LOS NUEVOS ELEMENTOS REGISTRADOS EN EL SISTEMA
						//	if((i+1) == len) { //alert("continue a rtas");	salir();	}
	            },options_foto
			);
			
			if((i+1)==len){
				tx.executeSql('SELECT "'+esquema+'" as esquema,id,url_video,id_envio FROM '+esquema+'t_video', [], 
				       (function(esquema){
				           return function(tx,results){
				               ConsultaSincronizarVideos(tx,results,esquema);
				           };
				       })(esquema),errorCB_Videos);
			}
			
	   	}		
	}
}

//SINCRONIZAR VIDEO
function ConsultaSincronizarVideos(tx, results, esquema) {
	var len = results.rows.length;	//alert(len);
	if(len==0){
		salir(esquema);
	}else{
		for (i = 0; i < len; i++){
			var parametros = new Object();
			var esquema = results.rows.item(i).esquema;
			var url_video = results.rows.item(i).url_video;				//alert(url_video);
			var tmp_url_video = url_video.split("@");
			var path = tmp_url_video[0];
			var name = path.replace(/^.*[\\\/]/, '');
			//var name = tmp_url_video[1];
			//alert(path); alert(name);
			
			var options = new FileUploadOptions(); 
				options.fileName = name;
				options.chunkedMode = false;
				options.headers = {Connection: "close"};
				

			var params = new Object();
				params.esquema = results.rows.item(i).esquema;
				params.cod_envio = results.rows.item(i).id_envio;			 //alert(results.rows.item(i).esquema + " -- " + results.rows.item(i).id_envio);
				params.url_video = url_video;
			
			options.params = params;
			
			//ENVIA EL VIDEO	
			var ft = new FileTransfer();
			ft.onprogress = function(progressEvent) {
				if (progressEvent.lengthComputable) {
					var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
					$("#resultado").html("<br>Cargando Video "+i+": <strong>"+perc + "% </strong><br>"); 
				} 
				if(perc >= 99) $("#resultado").html('');
				$("#resultado").trigger("create");
			};
			

			
			//sI EXISTE EL ARCHIVO LO ENVÍA
	        ft.upload(path,
	            "http://"+localStorage.url_servidor+"/SIG/servicios/sincronizar_video.php",
	            function(result) {
	            	
					var respf = result.response.trim();
					var n=respf.split("@@");

					var url_video_del = n[2];				//alert(url_video);
					var tmp_url_video_del = url_video_del.split("@");
					var path_del = tmp_url_video_del[0];
			

	            	//REMOVER ARCHIVO DEL DISPOSITIVO
	            	function eliminavideodb(tx) { //alert('DELETE from publicinventario_fotos where id_envio = "'+n[0]+'" and rowid = "'+n[1]+'"');
						tx.executeSql('DELETE from '+n[0]+'t_video where id_envio = "'+n[1]+'" and url_video = "'+n[2]+'"');
					}
	            	function sqlexitoso ()  {
						//CONTINUA CON LOS NUEVOS ELEMENTOS REGISTRADOS EN EL SISTEMA
						if((i+1) == len) { //alert("continue a rtas");
							   	salir(esquema);
						} 
						//Delete file 
						window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, 
						    function(fileSys) { 
						
						        fileSys.root.getFile(path_del, {create: false}, 
						            function(file) {
						                file.remove(pictureRemoved, notRemoved);                                                  
						            }, no);
						    }, no); 
					}
					function sqlfallo(){}
					function pictureRemoved(){}
					function notRemoved(){ $("#resultado").html("<br> No se puede Eliminar el archivo, limpie el cache manualmente<br>"); $("#resultado").trigger("create");}
					function no(error) { /*$("#resultado").html("<br> Ubicación incorrecta del Video<br>"); */}
	            	//ELIMINA DE LA BASE DE DATOS
	            	db.transaction(eliminavideodb,sqlfallo,sqlexitoso);
	                
	            },
	            function(error) {
	                alert('Error Cargando Archivo ' + path + ': ' + error.code);
	            },options
			);

			$("#resultado").html("<br>Videos restantes: "+(ttal_videos-i)+".<br>");
			$("#resultado").trigger("create");
			
			if((i+1) == len) { salir(esquema); }
	   	}		
	} /* */
}

function salir (esquema){
	db.transaction(function(tx) {
		tx.executeSql('SELECT esquema FROM p_verticales order by esquema desc limit 1', [],
						(function(esquema){
								       return function(tx,results){
								           SalirResp(tx,results,esquema);
								       };
								   })(esquema),errorCB_Respuestas);
	});
}

function SalirResp(tx, results, esquema) {
	var lon = results.rows.length; 					//alert(lon);
	var esquemaSql = results.rows.item(0).esquema; 	//alert(esquemaSql);
		
	if (esquemaSql ==esquema){
		$("#resultado").html('');							//alert('Cargue Exitoso');
		$("#btn_si").show();
		alerta("GeoMovil","Cargue de Información!","Ok","#");	//alerta("GeoMovil","Cargue exitoso","Ok","principal.html");
	}	
}

/*----------------LISTA INFORMACIÓN A CARGAR CUANDO INICIA EL APLICATIVO----------------*/

function Consulta(tx) {
	$("#registro_tabla").html("");
/*	$("#resultado").before('<br>Fotos Pendientes envío - '+results.rows.item(0).esquema+': '+ttal_fotos);
	$("#btn_si").show();
	$("#Lpregunta").html("Seguro que deseas cargar la Información?");*/
	tx.executeSql('SELECT esquema FROM p_verticales', [], ConsultaCarga,errorCB_items);
}
function ConsultaCarga(tx, results) {
	var len = results.rows.length;		
	//$("#resultado").before('Verticales encontradas :'+len);
	for (i = 0; i < len; i++){
		var esquema = results.rows.item(i).esquema;
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_fotos', [], ConsultaFotos,errorCB_Fotos);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_video', [], ConsultaVideos,errorCB_Videos);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_asignacion_lugar where estado = "C"', [], ConsultaAsignacion,errorCB_Asignacion);
		tx.executeSql('SELECT "'+esquema+'" as esquema,count(*) nreg FROM '+esquema+'t_rtas_formulario ', [], ConsultaResp,errorCB_Asignacion);
   };
}

//CONSULTA DE FOTOS PENDIENTES PARA CARGAR
function ConsultaFotos(tx, results) {	//	console.log('Reg: '+results.rows.item(0).nreg);
	if(results.rows.item(0).nreg != 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Fotos</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}

//CONSULTA DE VIDEOS PENDIENTES PARA CARGAR
function ConsultaVideos(tx, results) {
	if(results.rows.item(0).nreg > 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Videos</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}
//CONSULTA ASIGNACIÓN
function ConsultaAsignacion(tx, results) {
	if(results.rows.item(0).nreg > 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Encuestas</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}
//CONSULTA ASIGNACIÓN
function ConsultaResp(tx, results) {
	if(results.rows.item(0).nreg > 0){
		$("#listado_cargue").show();
		$("#registro_tabla").append('<tr><td>'+results.rows.item(0).esquema+' - Respuestas</td><td>'+results.rows.item(0).nreg+'</td></tr>');
		$("#btn_si").show();
		$("#Lpregunta").html("<br>Seguro que deseas cargar la Información?");
	}
}


$(document).ready(function(){
	datos_pendientes=false;
	
	$("#btn_si").click(function(event) {
		
		$("#btn_si").hide();	//$("#btn_no").remove();
		$("#Lpregunta").remove();
		db.transaction(ConsultaSincronizar);
		
		 refreshIntervalId = setInterval(function(){
		 	console.log("Buscar pendientes");
		 	db.transaction(Consulta);
		}, 3000);
		
		//clearInterval(refreshIntervalId);
		
	});

	$("#btn_no").click(function( event ) {
 		window.location = "principal.html";
	});
	
	$("#btn_si").hide();
	db.transaction(Consulta);
	
	$("#num_forms").html(localStorage.num_forms);

	
});
