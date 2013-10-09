responsive-iframe
=================

This project uses grunt, it has a npm dependency.  Install npm first then run:

```
npm install
```

To get all the required grunt packages.  Then run:

```
grunt server
```

and go to: http://127.0.0.1:9001/host.html

To play view any changes you make.

## Other implementations

### Let the iframe control itself

This would work if we wanted the iframe to be the same size as the host's today height, but we don't.  We want the iframe to be the height of its content.

```
<script type="text/javascript">
$(document).ready(function()
{
var i = setInterval(function(start){
resize_ifrm();
}, 20, new Date);
$("#tabs").tabs();
});
function resize_ifrm(){
$('#ifrm_report', parent.document.body).height($('#ifrm_report', parent.document.body).contents().find('body').height() + 30)
}
</script>
```