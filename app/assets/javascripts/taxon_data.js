if(!EOL) { var EOL = {}; }

EOL.max_meta_rows = 10;

EOL.enable_button = function($button) {
  if ($button.is(':disabled')) {
    $button.removeAttr('disabled').fadeTo(225, 1);
  }
};

EOL.disable_button = function($button) {
  if (!$button.is(':disabled')) {
    $button.attr("disabled", true).fadeTo(225, 0.3);
  }
};

EOL.attribute_is_not_okay = function() {
  $('input#user_added_data_predicate').addClass('problems');
  $('#new_uri_warning').show();
  // EOL.disable_button($('#new_user_added_data').find('input:submit'));
};

EOL.attribute_is_okay = function() {
  $('input#user_added_data_predicate').removeClass('problems');
  $('#new_uri_warning').hide();
  // EOL.enable_button($('#new_user_added_data').find('input:submit'));
};

EOL.add_has_default_behavior = function() {
  $('input.has_default').each(function() { 
    if ($(this).val() == '') {
      $(this).val($(this).attr('data-default')).fadeTo(225, 0.6);
    }
    $(this).unbind('focus').unbind('blur');
    $(this).on('focus', function() {
      if ($(this).val() == $(this).attr('data-default')) {
        $(this).val('').fadeTo(150, 1);
      }
    }).on('blur', function() {
      if ($(this).val() == '') {
        $(this).val($(this).attr('data-default')).fadeTo(225, 0.6);
      }
    });
  });
};


function update_input_id_and_name(form, new_id) {
  form.find('input').each(function() {
    $(this).attr('id', $(this).attr('id').replace(/\d+/, new_id));
    $(this).attr('name', $(this).attr('name').replace(/\d+/, new_id));
  });
}

EOL.limit_data_rows = function() {
  $('table.data tr.more').remove();
  $('table.data tr.data:visible').each(function() {
    if ( ! $(this).hasClass('nested')) {
      var $row = $(this).next().next(); // Skip a row because of actions
      var count = 0;
      while($row.hasClass('nested')) {
        count++;
        if (count > EOL.max_meta_rows) { $row.hide(); }
        $row = $row.next().next(); // Again, skipping actions.
      }
      if ($row.length == 0) {
        // We fell off the edge of the table!;
        $row = $('table.data tr:last').prev();
      }
      if (count == EOL.max_meta_rows+1) {
        $row.prev().prev().show(); // Ooops, show it, since there's only one more.
      } else if (count > EOL.max_meta_rows) {
        $row.next().after('<tr class="data nested more"><th></th><td colspan=3><a href="#" class="more">' +
          $('table.data').attr('data-more').replace('NNN', (count-EOL.max_meta_rows)) +
          '</a></td></tr>');
        $('tr.more a.more').click(function() {
          var $parent_row = $(this).closest('tr');
          var $next = $parent_row.prev().prev();
          $parent_row.remove();
          console.log($next);
          // TODO - we need to replace all these while-next things with a method that takes a closure as an arg...
          // (of course, this will have to be written to find the nearest non-nested, then iterate down. NBD.
          while($next.hasClass('nested')) {
            $next.show();
            $next = $next.prev().prev(); // Yup, skipping actions.
          }
          return(false);
        });
      }
    }
  });
};

$(function() {

  $('.has_many').each(function() {
    var $subform = $(this).clone();
    $subform.find('.once').remove();
    var last_input = $(this).closest('form').find('input[id^=user_added_data_user_added_data_metadata_attributes]').filter(':last');
    var highest_field_id = parseInt(last_input.attr('id').match(/(\d+)/)[1]);
    update_input_id_and_name($subform, highest_field_id += 1);
    $subform.appendTo($(this)).addClass('subform').hide();
    $(this).append('<span class="add"><a href="#">'+$(this).attr('data-another')+'</a></span>');
    $(this).find('.add a').click(function() {
      $subform.clone().insertBefore($(this).parent()).show();
      update_input_id_and_name($subform, highest_field_id += 1);
      var form_h = $('.has_many_expandable').height();
      $('.has_many_expandable').height(form_h + $subform.height());
      EOL.add_has_default_behavior();
      return(false);
    });
  });

  $('input#user_added_data_predicate').keyup(function() {
    var $field = $(this)
    if($field.val() != '') {
      $('div#suggestions').hide();
    }
    if ($field.val().match(/^ht/i)) {
      EOL.attribute_is_okay();
      $field.attr('data-autocomplete', $field.attr('data-http'));
    } else {
      $field.attr('data-autocomplete', $field.attr('data-orig'));
      EOL.attribute_is_not_okay();
      if($field.val() == '') {
        EOL.attribute_is_okay();
      } else {
        $('ul.ui-autocomplete').find('li').each(function(i, el) {
          if($(el).text() == $field.val()) {
            EOL.attribute_is_okay();
          }
        });
      }
    }
  }).focus(function() {
    $('div#suggestions').appendTo($(this).parent());
    if ($(this).val() == '') {
      $('div#suggestions').show();
    }
    $(this).parent().hover(function() {
      if (!$('ul.ui-autocomplete').is(':visible') && $(this).val() == '') {
        $('div#suggestions').show();
      }
    }, function () {
      $('div#suggestions').hide();
    });
  });

  $('table.data tr.actions').hide().prev().children('td.fold').html('<img src="/assets/arrow_fold_right.png" />').parent().on('click',
    function(e) {
    // if the target of the click is a link, do not hide the metadata
    if($(e.target).closest('a').length) return;
    var $folder = $(this).find('.fold');
    var $next_row = $(this).next();
    var $table = $(this).find('table');
    if ($next_row.is(":visible")) {
      $folder.html('<img src="/assets/arrow_fold_right.png" />');
      $next_row.hide();
      $table.hide();
      $(this).removeClass('open');
    } else {
      $folder.html('<img src="/assets/arrow_fold_down.png" />');
      $next_row.show();
      $table.show();
      $(this).addClass('open');
    }
  }).find('table').hide();

  $('#recently_used_category a').click(function() {
    $('#suggestions').find('.child').hide();
    var $next = $(this).parent().next();
    while($next.hasClass('child')) {
      $next.show();
      $next = $next.next();
    }
    return(false);
  });

  $('li.attribute').click(function() {
    $('#user_added_data_predicate').val($(this).find('.name').text());
    EOL.attribute_is_okay();
    $('div#suggestions').hide();
  });

  $('#tabs_sidebar.data ul a').click(function() {
    if($(this).hasClass('all')) { // Acts as a reset button/link
      $('table.data tr.actions').hide();
      $('table.data tr.data').show();
    } else if($(this).hasClass('other')) {
      $('table.data > tbody > tr').hide();
      $('table.data tr.data.toc_other').show();
    } else {
      $('table.data > tbody > tr').hide();
      $('table.data tr.data.toc_' + $(this).attr('data-toc-id')).show();
    }
    $(this).parent().parent().find('li').removeClass('active');
    $(this).parent().addClass('active');
    // Reset other aspects of the table:
    $('table.data tr.open').removeClass('open');
    $('table.data td.fold').html('<img src="/assets/arrow_fold_right.png" />');
    $('table.meta').hide();
    EOL.limit_data_rows();
    return(false);
  });

  EOL.limit_data_rows();

  EOL.add_has_default_behavior();

  if(location.hash != "") {
    var name  = location.hash.replace(/\?.*$/, '');
    var $row = $(name);
    $row.click();
    var new_top = $row.offset().top - 200;
    $("html, body").animate({ scrollTop: new_top });
  }

});
