EOL.init_collection_item_behaviours=function($collection){var $li=$(this);$li.find("p.edit").show().next().hide().end().find("a").click(function(){$(this).parent().hide().prev().hide().next().next().show();return(false);});$li.find(".collection_item_form input[type='submit']").click(function(){var $node=$(this).closest("li");EOL.ajax_submit($(this),{update:$node,data:"_method=put&commit_annotation=true&"+
$(this).closest(".collection_item_form").find("input, textarea").serialize(),complete:function(){$node.find(".collection_item_form").closest(".collection_item_form").hide().prev().show().prev().show();$node.each(EOL.init_collection_item_behaviours);}});return(false);});$li.find(".collection_item_form a").click(function(){$(this).closest(".collection_item_form").hide().prev().show().prev().show();return(false);});}
$(function(){$('#collections #sort_by').change(function(){$(this).closest('form').find('input[name="commit_sort"]').click();});$('#collections input[name="commit_sort"]').hide();(function($collection){$collection.find("ul.object_list li").each(EOL.init_collection_item_behaviours);})($("#collections"));});