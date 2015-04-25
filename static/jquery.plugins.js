$.api = function($url, $post, $callback){
	$url = "/API/" + (typeof $url == 'string' ? [$url] : $url).join('/');
	$.post($url, JSON.stringify($post || {}), $callback, 'json');
}

$.siteDialog = function($s){
	var $modal = $("#customModal");
	if($s == "close") {
		$modal.modal('hide');
		return;
	}
	$(".modal-title").html($s.title);
	$(".modal-body").html($s.text);
	$(".modal-footer").html("");
	if(typeof $s.buttons == "object"){
		var $d = 1;
		var $btns = {};
		$.each($s.buttons, function($name, $cbf){
			var $default = (typeof $cbf == "function" ? $cbf : function(){$.siteDialog('close')}),
			$btn = $("<button class='btn'></button>").appendTo(".modal-footer").html($name).click($default);
			$btns[$name] = $btn;
			if($d) $btn.addClass('btn-primary');
			$d = 0;
			})
		}
	$modal.modal();
	return $btns;
	}


$.formBuilder = function(elms){
	var $form = $("<form class='form-group' />").appendTo($("<div />"));
	var $table = $("<table class='table' />").appendTo($form);
	$("<thead> \
		<th>Field</th> \
		<th>Value</th> \
		</thead>").appendTo($table);
  var $tbody = $("<tbody />").appendTo($table);
	$.each(elms, function(nuhXD, $elm){
		var $row = $("<tr />").appendTo($tbody);
		$("<td />").html($elm.title).appendTo($row);
		switch($elm.type){
			case "select":
				var $select = $("<select />").attr({
					class : 'form-control',
					type : $elm.type,
					name : $elm.name,
					value : $elm.value
				})

				$.each($elm.options, function($value, name){
					var opt = $("<option />").html(name).val($value).appendTo($select)
					if($value == $elm.value)
						opt.attr('selected', 'selected');
				})

				$select.attr('value', $elm.value).appendTo($("<td />").appendTo($row));
			break;

			default:
				$("<input />").attr({
					class : 'form-control',
					type : $elm.type,
					value : $elm.value,
					name : $elm.name
				}).appendTo($("<td />").appendTo($row));
			break;

			case "hidden":
				$("<input />").attr({
					class : 'form-control',
					type : $elm.type,
					value : $elm.value,
					name : $elm.name
				}).appendTo($("<td />").appendTo($row)).parent().parent().hide();
			break;
		}
	})
	return $form;
}

$.requestData = function($title, $fields, $done){
	var $form = $.formBuilder($fields);
	var $id = 'requestDataFormID';
	$form.attr('id', $id);
	var $btns = $.siteDialog({
		title : $title,
		text : $form.parent().html(),
		buttons : {
			Update : function(){
				$("#" + $id).submit();
			},
			Cancel : 0
		}
	})
	$btns.Update.addClass('btn-success');
	$btns.Cancel.addClass('btn-danger')
	var $form = $("#" + $id).submit(function(e){
		e.preventDefault();
		var $dataObj = {};
		$.each($(this).serializeArray(), function(nuhXD, $elm){
			$dataObj[$elm.name] = $elm.value;
		})
		$done($dataObj);
	});
	return $btns;
}

$.loading = function(){
	$.siteDialog({
		title : "Loading",
		text : "Please Wait...",
		buttons : {}
	})
}

$.query = function($connection, $sql, $treat, $done){
	var client = new XMLHttpRequest(),
		post = {
			connection : $connection,
			sql : $sql
		},
		parse = function($response){
			var $rows = $response.split("\r\n"),
				$results = [];
			for(var x in $rows){
				try{
					var $data = JSON.parse($rows[x]);
					if(!$data)
						throw new Error("Bad JSON");
					$results.push($data);
				} catch($e){

				}
			}
			return $results;
		}
	client.open('POST', '/API/Query');
	client.send(JSON.stringify(post));
	
	var TimeOut = setInterval(function(){
		var $data = parse(client.responseText);
		$treat($data);
	}, 1000)

	client.onreadystatechange = function(){
		  if (client.readyState == 4 && client.status == 200){
		  		var $data = parse(client.responseText);
		    	$done($data);
		    	clearTimeout(TimeOut);
		    }
		  } 
		}

$.alert = function($msg){
	$.siteDialog({
		title : "Alert",
		text : $msg,
		buttons : {
			Ok : 0
		}
	})
}