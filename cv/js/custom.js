$(window).scroll(function(){
  if($(window).scrollTop() > 600) {
    $('.navbar-default').fadeIn(300)
  }
  else {
    $('.navbar-default').fadeOut(300)
  }

  if($(window).width() > 767) {
    if ($(this).scrollTop() > 600) {
      $('.scroll-up').fadeIn(300)
    } else {
      $('.scroll-up').fadeOut(300)
    }
  }
})

$(document).ready(function() {
  var resume = {}
  resume = store.get('resume')

  if (false && resume) { // TODO
    displayResume(resume)
  }
  else {
    // Using YQL and JSONP for resume.json, work around for CORS
    $.ajax({
      url: "http://query.yahooapis.com/v1/public/yql",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        //q: "select * from json where url=\"http://code.gavinengel.com/cv/js/resume-2015-xx-xx.json\"",
        q: "select * from json where url=\"https://raw.githubusercontent.com/gavinengel/gavinengel.github.io/master/cv/js/resume-2015-04-09.json\"",
        format: "json"
      },
      success: function( response ) {
        var resume = response.query.results.json

        // cache the json, to eliminate future ajax calls
        store.set('resume', resume)
        displayResume(resume)
      }
    })
  }


  function displayResume(resume) {
    console.log('Here is my raw resume:')
    console.log(resume)
    // About
    var list = resume.sections.summary.list
    $.each(list, function(i, obj) {
      $("#summary-items").append('<li>'+obj+'</li>')
    })

    // Job title
    $('#slideshow .slide1 span').html(resume.header.subtitle)
    console.log('subtitle: '+resume.header.subtitle)

    // Contact Info
    var list = resume.header.contact
    $.each(list, function(i, obj) {
      $("#contacts ul").append('<li>'+obj.type+': '+obj.value+'</li>')
      //console.log(obj.type + obj.value)
    }); 

    // Previous Work
    var list = resume.sections.prevwork.list
    $.each(list, function(i, obj) {
      $("section#blog.content-first .row").append('<div class="col-sm-4 scrollpoint sp-effectdisabled active animated fadeInRight"><div class="blog-post"><div class="blog-body"><p>' + obj + '</p><a href="http://' + obj + '" class="btn btn-primary noprint" target="_blank">Visit Site</a></div></div></div>')
    })

    // Concepts
    var list1 = resume.sections.concepts.sections
    $.each(list1, function(i, obj) {
      var insert = ''
      insert += '<div class="col-md-6 service scrollpoint sp-effectdisabled active animated fadeInLeft"><img class="noprint" src="image/concept-'+obj.key+'.png" alt="" style="padding-bottom: 0px;">'
      insert += '<h3>'+obj.title+'</h3>'

      // following logic to compensate with fact that Yahoo messes with single element arrays
      if (Array.isArray(obj.list)) {
        for (var j in obj.list) {
          insert += '<p>'+obj.list[j]+'</p>'
        }
      }
      else {
        insert += '<p>'+obj.list+'</p>'
      }

      insert += '</div>'
      $("#services .row").append(insert)
    })

    // Formal Education
    $('#pricing #formal .pricing-table h3').html(resume.sections.education.list[0].title)
    $('#pricing #formal .pricing-table ul').append('<li>'+resume.sections.education.list[0].desc+'</li>')
    $('#pricing #formal .pricing-table ul').append('<li>'+resume.sections.education.list[0].url+'</li>')

    // Certificates
    var list = resume.sections.certificates.list
    $.each(list, function(i, obj) {
      if (obj.title && obj.desc && obj.url) {
        var insert = '<p>' + obj.title + '</p><div><img src="image/moocs/'+ obj.site.toLowerCase().replace(/ /g,'') +'.png" /><a href="' + obj.url + '" class="btn btn-primary noprint" target="_blank">View Certificate</a></div>'
        $("#certificates").append('<div class="col-sm-10 scrollpoint sp-effectdisabled active animated fadeInRight"><div class="blog-post"><div class="blog-body">' + insert + '</div></div></div>')
      }
    })

    // Insurance 
    $('#insurance .insurance-table h3').html(resume.sections.insurance.provider)                // provider: "Hiscox Insurance Company Inc."
    $('#insurance .insurance-table ul').append('<li>type: '+resume.sections.insurance.type+'</li>')   // type: "Aggregate limit of liability:  $250,000"
    $('#insurance .insurance-table ul').append('<li>refid: '+resume.sections.insurance.refid+'</li>')  // refid: "UDC­1616273­EO­15"
    $('#insurance .insurance-table ul').append('<li>proof: <a href="'+resume.sections.insurance.proof+'">'+resume.sections.insurance.proof+'</a></li>')  // proof: "http://bit.ly/gavinengelinsurance"
    $('#insurance .insurance-table ul').append('<li>term end: '+resume.sections.insurance.end+'</li>')  // end: 



    // Professional Experience
    var list = resume.sections.profexp.sections
    $.each(list, function(i, obj) {
      var insert = ''
      insert += '<div class="row item"><div class="twelve columns"><h3>'+obj.title+'</h3><p class="info">'+obj.subtitle.loc+'<span> &bull; </span>'
      insert += '<em class="date">'+obj.subtitle.dates+'</em></p>'
      insert += '<p><ul>'

      $.each(obj.list, function(j, obj2) {
        insert += '<li>'+obj2+'</li>'
      })

      insert += '</ul></p></div></div>'

      $("#resume-items").append(insert)
    })
  }

  // Using YQL and JSONP for iheartquotes.com random quote
  /* TODO
  $.ajax({
    url: "http://query.yahooapis.com/v1/public/yql",
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      q: "select * from json where url=\"http://www.iheartquotes.com/api/v1/random?max_characters=200&format=json&source=esr+humorix_misc+joel_on_software+macintosh+math+mav_flame+osp_rules+paul_graham+prog_style+liberty+literature+misc+murphy+rkba+shlomif_fav+stephen_wright\"",
      format: "json"
    },
    success: function( response ) {
      var source = response.query.results.json.source 
      var full = response.query.results.json.quote
      full = full.replace("\n\n-", '--') // some authors have a single dash in front. sigh.
      var pieces = full.split('--')
      var quote = pieces[0]
      var author = (pieces[1])? pieces[1] : 'anonymous'

      $('.blockquote-reverse span').html(quote)
      $('.blockquote-reverse footer').html(author + '<!-- source: ' + source + '-->')
    }
  })
*/
  $.ajax({
    url: "http://quotely.gavinengel.com?svc=4",
    jsonp: "callback",
    dataType: "jsonp",
    data: {
      //q: "select * from json where url=\"http://www.iheartquotes.com/api/v1/random?max_characters=200&format=json&source=esr+humorix_misc+joel_on_software+macintosh+math+mav_flame+osp_rules+paul_graham+prog_style+liberty+literature+misc+murphy+rkba+shlomif_fav+stephen_wright\"",
      format: "json"
    },
    success: function( response ) {
      console.log('here is quotely response:');
      //console.log(response)
      /*
      var source = response.query.results.json.source 
      var full = response.query.results.json.quote
      full = full.replace("\n\n-", '--') // some authors have a single dash in front. sigh.
      var pieces = full.split('--')
      var quote = pieces[0]
      var author = (pieces[1])? pieces[1] : 'anonymous'

      $('.blockquote-reverse span').html(quote)
      $('.blockquote-reverse footer').html(author + '<!-- source: ' + source + '-->')
      */
    }
  })

  $("a.scroll[href^='#']").on('click', function(e) {
    e.preventDefault()
    var hash = this.hash
    $('html, body').animate({ scrollTop: $(this.hash).offset().top}, 1000, function(){window.location.hash = hash;})
  })

 
  $('#overlay-hide').click(function() {
    $('#reference .reference-overlay').animate({opacity:0},1000)
    $('#reference-text').animate({opacity:0},1000)
  })

  $('.overlay-wrapper').mouseenter(function() {
    $(this).find('.overlay a:first-child').addClass('animated slideInLeft')
    $(this).find('.overlay a:last-child').addClass('animated slideInRight')
  })

  $('.overlay-wrapper').mouseleave(function() {
    $(this).find('.overlay a:first-child').removeClass('animated slideInLeft')
    $(this).find('.overlay a:last-child').removeClass('animated slideInRight')
  })

  $('.carousel').mouseenter(function() {
    $('.carousel-control').fadeIn(300)
  })

  $('.carousel').mouseleave(function() {
    $('.carousel-control').fadeOut(300)
  })

  $('#separator').waypoint(function(){$('#separator .number').countTo();},{offset:'85%'})

  if($(window).width() > 767) {
    $('.service').mouseenter(function(e) {
        $(this).find('img').animate({paddingBottom: "15px"},500)
    })

    $('.service').mouseleave(function(e) {
        $(this).find('img').stop().animate({paddingBottom: "0px"},500)
    })
  }

  if($(window).width() > 767) {
    $('.scrollpoint.sp-effect1').waypoint(function(){$(this).toggleClass('active');$(this).toggleClass('animated fadeInLeft');},{offset:'90%'})
    $('.scrollpoint.sp-effect2').waypoint(function(){$(this).toggleClass('active');$(this).toggleClass('animated fadeInRight');},{offset:'90%'})
    $('.scrollpoint.sp-effect3').waypoint(function(){$(this).toggleClass('active');$(this).toggleClass('animated fadeInDown');},{offset:'90%'})
    $('.scrollpoint.sp-effect4').waypoint(function(){$(this).toggleClass('active');$(this).toggleClass('animated fadeIn');},{offset:'70%'})
  }
})


