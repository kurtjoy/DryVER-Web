<body>
<%
If Request.Form("user") = "Test" AND Request.Form("password") = "Test" Then
Response.Redirect ("dryver.html")
Else
Response.Write "Access Denied!"
'Response.End
End If
%>
</body>