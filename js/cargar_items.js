/**
 * @author DGPJ 20130902
 * @Modifi DGPJ 20130917
 * @Modif. DGPJ 20140813
 */
/*VARIABLES GLOBALES*/
var db = window.openDatabase("bdgeoforms", "1.0", "Proyecto Formularios", 134217728 );
var esquema = localStorage.esquema;				//Esquema
var id_categoria = localStorage.id_categoria;	//Id Categoria
var id_usr = localStorage.id_usr;				//Id Usuario
var asignado = localStorage.asignado;			//Asignado = t Nuevo = f
var id_asignacion = localStorage.id_asignado;	//SI Asignado = t. Entonces retorna el Id de Asignación
var geotabla = localStorage.geotabla;			//SI Asignado = t. Nombre de la tabla Geometrica
var id_feature = localStorage.id_feature;		//SI Asignado = t. Id de la tabla geometrica
var i_foto=0;
localStorage.id_unico ="";

/*VARIABLES LOCALES*/
var id_item_last;

function msj_peligro(msj){
	$.notify({  icon: 'glyphicon glyphicon-warning-sign',
				message:msj
			 }, { 
			type: "danger",
			allow_dismiss: false, 
			timer : 100,
			delay: 3000,
				animate: {
					enter: 'animated zoomInDown',
					exit: 'animated zoomOutUp'
				},
				placement: {
					from: "top",
					align: "center"
				}
			}
		);
}
function scanea(idTxt){
	cordova.plugins.barcodeScanner.scan(
	      function (result) {
	      	if (!result.cancelled){
	      		$("#"+idTxt+"").val(result.text);
	      		$("#"+idTxt+"").prop('disabled', true);
				//VALOR RESPUESTA
				localStorage.tmp_id_item_vr = result.text;
				// VALOR ID ITEM A MOSTRAR
				localStorage.tmp_id_item = idTxt;
				// CARGAR form_guardar DE LA BASE DE DATOS
				db.transaction(SeleccionItemsFiltrar);
	      	}else{
	      		$("#"+idTxt+"").prop('disabled', false);
	      	}
	      	
			console.log("We got a barcode\n" +
	                "Result: " + result.text + "\n" +
	                "Format: " + result.format + "\n" +
	                "Cancelled: " + result.cancelled);
	      }, 
	      function (error) {
	          console.log("Scanning failed: " + error);
	          $("#"+idTxt+"").prop('disabled', false);
	      },
	      {
	          preferFrontCamera : false, // iOS and Android
	          showFlipCameraButton : true, // iOS and Android
	          showTorchButton : true, // iOS and Android
	          torchOn: false, // Android, launch with the torch switched on (if available)
	          prompt : "Ubique el código dentro del cuadro", // Android
	          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
	      }
	   );
	
}
/*
function SeleccionItems(tx) {
	//console.log('select id_item from '+esquema+'p_items_adicional where id_rta = "'+localStorage.id_rta+'"');
	tx.executeSql('select id_item from '+esquema+'p_items_adicional where id_rta = "'+localStorage.id_rta+'"', [], SeleccionItemsResult,errorCB);
} */
function SeleccionItemsResult(tx, results) {
	var len = results.rows.length;	//alert(len);
	for (i = 0; i < len; i++){
		var id_item = results.rows.item(i).id_item;
		console.log("Mostrar elemento: "+id_item);
		$("#l"+id_item+"").show();
		$("#"+id_item+"").show();
		$("#"+id_item+"").prop('required',true);
		$("#"+id_item+"").attr('visible','true');
		$("#f"+id_item+"").addClass('required');
		
    }

    
    if(len == 0){
    	db.transaction(SeleccionItemsOcultar);	
    }
}

function SeleccionItemsOcultar(tx) {	console.log('select iadd.id_rta,iadd.id_item from '+esquema+'p_items_adicional iadd inner join '+esquema+'p_rtas_seleccion rtas on iadd.id_rta = rtas.id inner join '+esquema+'p_items_formulario item on item.id_item = rtas.id_item where id_categoria = "'+localStorage.id_categoria+'" and item.id_item = "'+localStorage.tmp_id_item+'" order by iadd.id_item desc');
	tx.executeSql('select iadd.id_rta,iadd.id_item from '+esquema+'p_items_adicional iadd inner join '+esquema+'p_rtas_seleccion rtas on iadd.id_rta = rtas.id inner join '+esquema+'p_items_formulario item on item.id_item = rtas.id_item where id_categoria = "'+localStorage.id_categoria+'" and item.id_item = "'+localStorage.tmp_id_item+'" order by iadd.id_item desc', [], SeleccionItemsOcultarResult,errorCB);
}
function SeleccionItemsOcultarResult(tx, results) {
	var len = results.rows.length;	//alert(len);
	for (i = 0; i < len; i++){
		var id_item = results.rows.item(i).id_item;
		var id_rta = results.rows.item(i).id_rta; console.log(localStorage.id_rta + " Loop: " + id_rta);
		if(localStorage.tmp_id_rta == id_rta){
			console.log("Mostrar elemento: "+id_item);
			$("#l"+id_item+"").show();
			$("#"+id_item+"").show();
			$("#"+id_item+"").prop('required',true);
			$("#"+id_item+"").attr('visible','true');
			$("#f"+id_item+"").addClass('required');
		}else{
			console.log("Ocultar elemento: "+id_item);
			$("#"+id_item+"").removeAttr('required');
			$("#"+id_item+"").attr('visible','false');
			$("#f"+id_item+"").removeClass('required');
			$("#l"+id_item+"").hide();
			$("#"+id_item+"").hide();			
		}
			

   	}
   
}
function SeleccionItemsFiltrar(tx) {	console.log('select rs.id as id_add,rs.valor,rs.descripcion,id_item_hijo,vr_padre from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" order by rs.descripcion');
 	tx.executeSql('select rs.id as id_add,rs.valor,rs.descripcion,id_item_hijo,vr_padre from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" order by rs.descripcion', [], seleccionItemsFiltrarResult,errorCB);
}

function seleccionItemsFiltrarResult(tx, results) {
 	var len = results.rows.length;	//console.log(len);
 	var id_select;	
 	if(len > 0){
 		id_select = results.rows.item(0).id_item_hijo;
		var tipoElem = $('#'+id_select)[0].nodeName.toUpperCase();	console.log(tipoElem + ": " + id_select);
		if(tipoElem=="SELECT"){
	 		$('#'+id_select).find('option').remove().end();		
	 		$('#'+id_select).append('<option value="">---Seleccione---</option>');
		 	for (i = 0; i < len; i++){
		 		if(results.rows.item(i).vr_padre == localStorage.tmp_id_item_vr) $('#'+id_select).append('<option value="'+results.rows.item(i).valor+'@'+results.rows.item(i).id_add+'">'+results.rows.item(i).descripcion+'</option>');
		    }
		}else if(tipoElem=="SPAN"){
		    localStorage.id_select = id_select;
		    $('#'+id_select).html('');
			db.transaction(SeleccionItemsFiltrarNomb);
/*            for (i = 0; i < len; i++){
                if(results.rows.item(i).vr_padre==localStorage.tmp_id_item_vr) $('#'+id_select).html(results.rows.item(i).descripcion);
            }   */
		}
 	}
 }

 function SeleccionItemsFiltrarNomb(tx) {	console.log('select rs.descripcion from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" and vr_padre ="'+localStorage.tmp_id_item_vr+'" order by rs.descripcion');
  	tx.executeSql('select rs.descripcion from '+esquema+'p_items_filtro itf left join '+esquema+'p_rtas_seleccion rs on itf.id_item_hijo = rs.id_item where id_item_padre = "'+localStorage.tmp_id_item+'" and vr_padre ="'+localStorage.tmp_id_item_vr+'" order by rs.descripcion', [], SeleccionItemsFiltrarNombResult,errorCB);
 }
 function SeleccionItemsFiltrarNombResult(tx, results) {
    console.log(results.rows.length);
    if(results.rows.length > 0){
        $('#'+localStorage.id_select).html(results.rows.item(0).descripcion);
    }else $('#'+localStorage.id_select).html('No se encontró descripción!');
 }


function getval(sel) {
	console.log("Id: "+sel.id);
	var res = sel.value.split("@");
	//VALOR RESPUESTA
	var tmp_id_item_vr = res[0];
	// VALOR ID RESPUESTA
	var tmp_id_rta = res[1];
	// VALOR ID ITEM A MOSTRAR
	var tmp_id_item = res[2];
	//Variable Global como localStorage
	localStorage.tmp_id_item = sel.id;
	localStorage.tmp_id_rta = tmp_id_rta;
	localStorage.tmp_id_item_vr = tmp_id_item_vr;
	console.log("ORIGEN  Id item: " + localStorage.tmp_id_item + " - Id rta: " + localStorage.tmp_id_rta + " - Vr: " + localStorage.tmp_id_item_vr);
	// CARGAR form_guardar DE LA BASE DE DATOS
	db.transaction(SeleccionItemsOcultar);
	// CARGAR form_guardar DE LA BASE DE DATOS
	db.transaction(SeleccionItemsFiltrar);
}
    
/****************************************************************************************************************************************************************/
function errorCB(err) {
	// Esto se puede ir a un Log de Error dir�a el purista de la oficina, pero como este es un ejemplo pongo el MessageBox.Show :P
	if (err.code !== undefined && err.message !== undefined){
    	alerta("GeoMovil","Error procesando SQL: Codigo: " + err.code + " Mensaje: "+err.message,"Ok","#");
   	}
}
/****************************************************************************************************************************************************************/
/**CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS****CARGAR ITEMS**/ 
function ConsultaItems(tx) {
	console.log('select it.id_item, it.descripcion_item, it.tipo_rta, it.obligatorio,rt.descripcion,rt.valor,rt.id id_add  from '+esquema+'p_items_formulario it left join '+esquema+'p_rtas_seleccion rt on it.id_item = rt.id_item and valor != "" where id_categoria="'+id_categoria+'" order by CAST(orden as integer),CAST(it.id_item as integer)');
	tx.executeSql('select it.id_item, it.descripcion_item, it.tipo_rta, it.obligatorio,rt.descripcion,rt.valor,rt.id id_add  from '+esquema+'p_items_formulario it left join '+esquema+'p_rtas_seleccion rt on it.id_item = rt.id_item and valor != "" where id_categoria="'+id_categoria+'" order by CAST(orden as integer),CAST(it.id_item as integer)', [], ConsultaItemsCarga,errorCB);
}
function ConsultaItemsCarga(tx, results) {
	var len = results.rows.length;	console.log(len);

	for (i = 0; i < len; i++){
		
		//Si encuentra formulario lo suma al contador de Formularios
		var num_actual = $("#num_preguntas").html();
		
		var rta = results.rows.item(i).tipo_rta;
		var id_item = results.rows.item(i).id_item;
		var descripcion_item = results.rows.item(i).descripcion_item; var descripcion_item = descripcion_item.replace(/&lt;/g, "<");var descripcion_item = descripcion_item.replace(/&gt;/g, ">");
		var obligatorio = ""; //console.log(results.rows.item(i).obligatorio.trim());
		if(results.rows.item(i).obligatorio.trim() == "S") {obligatorio = "required";}

		if (rta == "TEXTO" && id_item_last != id_item){
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+'</label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value=""  maxlength="255" '+obligatorio+' visible="true"/></div>');
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "PARRAFO" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+'</label><textarea class="form-control" cols="40" rows="8"  name="'+id_item+'" id="'+id_item+'" value="" '+obligatorio+' visible="true"/></textarea></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "CANTIDAD" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+'</label><input type="number" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="" '+obligatorio+' onkeypress="if (event.keyCode< 48 || event.keyCode > 57) event.returnValue = false;" visible="true"/></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "FECHA" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label" >'+descripcion_item+'</label><input type="text" class="form-control" tipo="fecha"  name="'+id_item+'" id="'+id_item+'" value="" '+obligatorio+' onkeypress="if (event.keyCode< 47 || event.keyCode > 57) event.returnValue = false;" visible="true"/></div>');
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "SELECCION") {
			if(id_item_last != id_item){
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="select control-label"" >'+descripcion_item+'</label><select class="form-control" name="'+id_item+'" id="'+id_item+'" '+obligatorio+' onchange="getval(this);" visible="true"><option value=""></option</select></div>');
				$("#num_preguntas").html(parseInt(num_actual) + 1);	
			}
			if(results.rows.item(i).valor != null) { $('#'+id_item).append('<option value="'+results.rows.item(i).valor+'@'+results.rows.item(i).id_add+'">'+results.rows.item(i).descripcion+'</option>'); }	
		}else if (rta == "LISTA") {
			if(id_item_last != id_item){
				$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="select control-label"" >'+descripcion_item+'</label></div>');
				$("#num_preguntas").html(parseInt(num_actual) + 1);	
			}
			if(results.rows.item(i).valor != null) { $('#f'+id_item).append('<input type="checkbox" name="'+id_item+'" id="'+id_item+'" value="'+results.rows.item(i).valor+'" visible="true"> '+results.rows.item(i).descripcion+'<br>'); }	
		}else if (rta == "LECTOR" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group '+obligatorio+'"><label name="l'+id_item+'" id="l'+id_item+'" class="control-label">'+descripcion_item+'</label><input type="text" class="form-control" name="'+id_item+'" id="'+id_item+'" placeholder="'+descripcion_item+'" value="" '+obligatorio+' visible="true" disabled="true"/><button onclick="scanea('+id_item+')" id="btn_scanea'+id_item+'" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-chevron-up"></span> Escanear <span class="glyphicon glyphicon-qrcode"></span></button></div>');	/* $('#'+id_item).textinput(); */
			$("#num_preguntas").html(parseInt(num_actual) + 1);
		}else if (rta == "INFO" && id_item_last != id_item) {
			$("#items").append('<div id="f'+id_item+'" class="form-group "><span name="'+id_item+'" id="'+id_item+'" class="label label-info">'+descripcion_item+'</span></div>');	/* $('#'+id_item).textinput(); */
		}
		if((i+1)==len){		//DESPUES DE CARGAR TODOS LOS REGISTROS
			// OCULTAR ITEMS
			db.transaction(OcultarItems);
		}
	
	id_item_last = id_item;
   	}
   	
/* JQUERY FINAL DE INSTRUCCIÓN*/
	
    /* ADICIONA OPCIONES PARA LA FECHA */
    $("input[tipo='fecha']").datepicker({
		    format: "yyyy/mm/dd",
		    todayBtn: "linked",
		    language: "es",
		    multidate: false,
		    keyboardNavigation: false,
		    autoclose: true,
		    todayHighlight: true
	});

}
/***FIN CARGAR ITEMS*************************************************************************************************************************************************************/

/****************************************************************************************************************************************************************/
/**OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO******OCULTAR ITEMS POR DEFECTO*****/ 
function OcultarItems(tx) { //console.log('SELECT iadd.id_item FROM '+esquema+'p_items_formulario itemfor inner join '+esquema+'p_items_adicional iadd on itemfor.id_item = iadd.id_item where id_categoria = "'+id_categoria+'" order by iadd.id_item desc');
	
	tx.executeSql('SELECT iadd.id_item FROM '+esquema+'p_items_formulario itemfor inner join '+esquema+'p_items_adicional iadd on itemfor.id_item = iadd.id_item where id_categoria = "'+id_categoria+'" order by iadd.id_item desc', [], OcultartemsResult,errorCB);
}
function OcultartemsResult(tx, results) {
	var len = results.rows.length;	//alert(len);
	for (i = 0; i < len; i++){
		var id_item = results.rows.item(i).id_item;
		
		$("#l"+id_item+"").hide();
		$("#"+id_item+"").removeAttr('required');
		$("#"+id_item+"").attr('visible','false');
		$("#f"+id_item+"").removeClass("required");
		$("#"+id_item+"").hide();
   	}

}
/***FIN OCULTAR ITEMS*************************************************************************************************************************************************************/

function activaTab(tab){
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    };

function comprobarCamposRequired(){
	var correcto=true;
	if (myLatitud===undefined || myLatitud=="undefined"){myLatitud="";}
	if (myLongitud===undefined || myLongitud=="undefined"){myLongitud="";}
	if (myPrecision===undefined || myPrecision=="undefined"){myPrecision="";}

	if(localStorage.geometria_obligatorio == "S" && (localStorage.geometria == "" || localStorage.geometria === undefined) && correcto==true){
			correcto=false;
			msj_peligro("Debe ingresar una geometría tipo "+ localStorage.tipo_geometria);
			activaTab('tab4_geom');
	}
	
	if(correcto==true){
	   $(':input').each(function () {	//console.log($(this).val());
			if($(this).attr("required")){
			      if($(this).val() =='' || $(this).val() === ""){		//console.log("Entró");
			         correcto=false;
			         var currentId = $(this).attr('id');	console.log(currentId);
			         msj_peligro("Debe diligenciar: " +  $("#l"+currentId).text());
			         activaTab('tab1_form');
			         $("#"+currentId).focus();
			         return false;
			      }
			}
	
	   });
	}
	
	if(localStorage.geolocaliza_obligatorio == "S" && (myLatitud=="" || myLongitud=="") && correcto==true){
			correcto=false;
			alert("No hay coordenadas registradas, active el GPS y busque un lugar abierto");
	}
	
	
	if(correcto==true){	//localStorage.foto_obligatorio == "S" &&
		//GUARDA FOTOS
		 var num_reg = 0;
		 $("img").each(function() {
			if($(this).attr('src')!="")  num_reg++;
		});
		if(num_reg != localStorage.foto_obligatorio){
			correcto=false;
			msj_peligro("Mínimo de fotos: " + localStorage.foto_obligatorio);
			activaTab('tab2_foto');
		}
	}
	if(correcto==true){
		var num_reg = 0;
		$("video").each(function() {
			if($(this).attr('src')!="")  num_reg++;
		});
		if(num_reg != localStorage.video_obligatorio){
			correcto=false;
			msj_peligro("Mínimo de Videos: "+localStorage.video_obligatorio);
			activaTab('tab3_video');
		}
	}	
	
	console.log(correcto);
	
	return correcto;
}
/**************************************************************************************************************************************************************************/
/**GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS****GUARDAR ITEMS**/
function GuardarItemsExe(tx) {	
	//activaTab('tab1_form');
	var now = new Date();
	var fecha_captura = now.getFullYear()+'-'+(1+now.getMonth())+'-'+now.getDate()+'-'+now.getHours()+'_'+now.getMinutes()+'_'+now.getSeconds();
	var id_unico = fecha_captura+'-'+id_usr;

	//GUARDA Y ACTUALIZA LA TABLA ASIGNACION
	if(asignado=="t"){	//si es asignado
		tx.executeSql('UPDATE '+esquema+'t_asignacion_lugar set id_envio = "'+id_unico+'",fecha_ejecucion = "'+fecha_captura+'",latitud_envio="'+myLatitud+'",longitud_envio="'+myLongitud+'",exactitud="'+myPrecision+'",id_encuestador = "'+id_usr+'",estado="C",feature="'+localStorage.geometria+'" where id = "'+id_asignacion+'"');
	}else				//si es Nuevo
	{
		localStorage.id_unico = id_unico;		//alert('INSERT INTO '+esquema+'t_asignacion_lugar (id_encuestador,id_categoria,estado,id_usuario_asign,fecha_asignacion,fecha_ejecucion,latitud_envio,longitud_envio,exactitud,id_envio,tipo_ingreso,feature) values ("'+id_usr+'","'+id_categoria+'","C","'+id_usr+'","'+fecha_captura+'","'+fecha_captura+'","'+myLatitud+'","'+myLongitud+'","'+myPrecision+'","'+id_unico+'","N","'+localStorage.geometria+'")');
		tx.executeSql('INSERT INTO '+esquema+'t_asignacion_lugar (id_encuestador,id_categoria,estado,id_usuario_asign,fecha_asignacion,fecha_ejecucion,latitud_envio,longitud_envio,exactitud,id_envio,tipo_ingreso,feature) values ("'+id_usr+'","'+id_categoria+'","C","'+id_usr+'","'+fecha_captura+'","'+fecha_captura+'","'+myLatitud+'","'+myLongitud+'","'+myPrecision+'","'+id_unico+'","N","'+localStorage.geometria+'")');
	}
	//SELECCIONA LOS ELEMENTOS DEL FORMULARIO
	 $(':input').each(function () {
			var $this = $(this),id_item = $this.attr('name');
			if(id_item!==undefined && id_item!="" && id_item!="id_geometria" ){
				//LLAMA VALOR
				var cant_val = $(this).val();
				//SI ES TIPO SELECT QUITA EL ID DE OCULTAR O MOSTRAR
				var res = cant_val.split("@");
				// VALOR FINAL A GUARDAR
				var cant_val = res[0].trim(); 					console.log (id_item + " : " + cant_val + "Visible: " + $(this).attr('visible') + "Checked: " + $(this).attr('type'));

				if( ( $(this).attr('type') != 'checkbox' && $(this).attr('visible') == 'true' && cant_val != "") || ($(this).attr('type') == 'checkbox' && $(this).is(':checked')) ){
					if(asignado=="t"){	//si es asignado
						tx.executeSql('INSERT INTO '+esquema+'t_rtas_formulario (id_asignacion,id_item,respuesta,id_envio) values ("'+id_asignacion+'","'+id_item+'","'+cant_val+'","'+id_unico+'")');
					}else				//si es Nuevo registro no asignado
					{
						tx.executeSql('INSERT INTO '+esquema+'t_rtas_formulario (id_item,respuesta,id_envio) values ("'+id_item+'","'+cant_val+'","'+id_unico+'")');
						console.log('INSERT INTO '+esquema+'t_rtas_formulario (id_item,respuesta,id_envio) values ("'+id_item+'","'+cant_val+'","'+id_unico+'")');
					}
				}
           }
	 });
	//GUARDA FOTOS 
	if(localStorage.Fotos != null && localStorage.Fotos != "" && localStorage.Fotos !== undefined && localStorage.Fotos != "undefined"){
		var num_reg = 0;
		//CARGA FOTOS
		var data = JSON.parse(localStorage.getItem('Fotos'));
		$.each(data, function(i, item) {	//alert(data[i]);
			tx.executeSql('INSERT INTO '+esquema+'t_fotos (id,url_foto,id_envio) values ("'+num_reg+'","'+data[i]+'","'+id_unico+'")');
			num_reg++;
		});
		data.length=0;
		localStorage.Fotos = "";				
	}
	
	//GUARDA VIDEOS
	if(localStorage.Videos != null && localStorage.Videos != "" && localStorage.Videos !== undefined && localStorage.Videos != "undefined"){
		var num_reg = 0;
		//CARGA VIDEOS
		var data = JSON.parse(localStorage.getItem('Videos'));
		$.each(data, function(i, item) {	//alert(data[i]);
			tx.executeSql('INSERT INTO '+esquema+'t_video (id,url_video,id_envio) values ("'+num_reg+'","'+data[i]+'","'+id_unico+'")');
			num_reg++;
		});
		data.length=0;
		localStorage.Videos = "";				
	}

	localStorage.feature="";
	localStorage.geometria="";
	console.log("Almacenamiento Exitoso");
	if(asignado=="t"){	//si es asignado
		alerta("GeoData - Guardar","Información Guardada exitosamente","Ok","mapa/mobile-jq.html");
	}else{
		alerta("GeoData - Guardar","Información Guardada exitosamente","Ok","principal.html");
	}

}
/***FIN GUARDAR ITEMS***********************************************************************************************************************************************************************/
/****CONSULTA GENERAL********CONSULTA GENERAL********CONSULTA GENERAL********CONSULTA GENERAL********CONSULTA GENERAL****/
function ConsultaGeneral(tx) {
	tx.executeSql('select * from '+esquema+geotabla+' where id = "'+id_feature+'"', [], ConsultaGeneralResp);
}
function ConsultaGeneralResp(tx, resultsT) {
	var lon = resultsT.rows.length;						//alert(lon);
	for (i = 0; i < lon; i++){
		var row = resultsT.rows.item(i);
		var string;
		var num_col = 0;
		for (name in row)
		{
			if (num_col<3){
				if (typeof row[name] !== 'function')
				{
					if(num_col==0){
						string = row[name] + " | ";	
					}else
					{
						string = string + row[name] + " | ";
					}
				}
			}
			num_col++;
		}
		$("#titulo").append(string);
   	}
}
/************************************************************************************************************************/
/************************************************************************************************************************/
/************************************************************************************************************************/
$(document).ready(function(){

	$("#titulo").html('<strong><h4></h4>'+localStorage.nombre_form+'</strong>');

	//localStorage.feature = "add"; //Si es registro nuevo limpia la variable geometria
	if (localStorage.geometria != "" && localStorage.geometria !== undefined) {
		$("#Subtitulo").append("<br><label style='color:#81B944'>Geomertría correctamente cargada</label>");
	}
	console.log(localStorage.tipo_geometria);
	if(localStorage.tipo_geometria=="POLIGONO"){
		$('#id_geometria').append('<option value="polygon">Pol&iacute;gono</option>');
	}else if(localStorage.tipo_geometria=="PUNTO"){
		$('#id_geometria').append('<option value="point">Punto</option>');
	}else if(localStorage.tipo_geometria=="LINEA"){
		$('#id_geometria').append('<option value="line">L&iacute;nea</option>');
	}
	//REINICIA EL CONTADOR DE LAS PREGUNTAS
	$("#num_preguntas").html(0);
	
	// CARGAR ITEMS DE LA BASE DE DATOS
	db.transaction(ConsultaItems);
	
	$("[id*=guardar]").click(function() {
		//activaTab('tab1_form');
		if(comprobarCamposRequired()){
	   		db.transaction(GuardarItemsExe);
		}
	});
	$("[id*=salir]").click(function() {
		app.salir();
	});

	$("#id_geometria").change(function() {
		var v = $(this).val();
		if (v != null ){
			localStorage.feature = v;
			window.location = "mapa_geom/mobile-jq-geom.html";
		}
		
	});
	
	$('div[data-role="navbar"] a').click(function () {
	    $(this).addClass('ui-btn-active');
	    $('div.content_div').hide();
	    $('div#' + $(this).attr('data-href')).show();
	});
	
	function contar_fotos(){
		var n = 0;
		$("img").each(function() {
			if($(this).attr('src')!="")  n++;
		});
		return n;
	}
	
	function contar_videos(){
		var v = 0;
		$("video").each(function() {
			if($(this).attr('src')!="")  v++;
		});
		return v;
	}
	
	$("#add_foto").click(function() {
		
		//alert(contar_fotos());
		if (contar_fotos() == localStorage.foto_max){
			msj_peligro("Máximo de fotos permitidas: "+ localStorage.foto_max);
			return false;
		}
		
		if (typeof cordova !== 'undefined'){
			navigator.camera.getPicture(onPhotoDataSuccess, onFail, opcionesCamara); 	
		}else{
			onPhotoDataSuccess("data:image/jpeg;base64,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");		
		}

		return false;
	});
	
	$("#add_video").click(function() {
		
		if (contar_videos() == localStorage.video_obligatorio){
			msj_peligro("Máximo de Videos permitidos: "+ localStorage.video_obligatorio);
			return false;
		}
		
		navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});
		return false;
	});
	
	$('#adjuntar').hide();
	if(localStorage.geometria_obligatorio == "S"){
		activaTab("tab4_geom");
	}else if(localStorage.geometria_obligatorio == "0"){
		$("#Lid_geometria").hide();
		$("#id_geometria").hide();
	}
	
	
	
	//VALIDA SI CAPTURA FOTO
	if (localStorage.foto_obligatorio == 0){
		$("#tabFotos").hide();
	}
	
	//VALIDA SI CAPTURA VIDEO  
	if (localStorage.video_obligatorio == 0){
		$("#tabVideos").hide();
	}

});