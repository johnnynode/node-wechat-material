'use strict';

var ejs = require('ejs');
var heredoc = require('heredoc');

var tpl = heredoc(() => {
    /*
    <xml>
        <ToUserName><![CDATA[<%= msg.FromUserName %>]]></ToUserName>
        <FromUserName><![CDATA[<%= msg.ToUserName %>]]></FromUserName>
        <CreateTime><%= createTime %></CreateTime>
        <MsgType><![CDATA[<%= msgType %>]]></MsgType>
        <% if (msgType === 'text') { %>
            <Content><![CDATA[<%= content %>]]></Content>
        <% } else if(msgType === 'image') { %>
            <Image>
                <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
            </Image>
        <% } else if(msgType === 'voice') { %>
            <Voice>
                <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
            </Voice>
        <% } else if(msgType === 'video') { %>
            <Voice>
                <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
                <Title><![CDATA[<%= content.title %>]]></Title>
                <Description><![CDATA[<%= content.description %>]]></Description>
            </Voice>
        <% } else if(msgType === 'music') { %>
            <Music>
                <Title><![CDATA[<%= content.title %>]]></Title>
                <Description><![CDATA[<%= content.description %>]]></Description>
                <MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
                <HQMusicUrl><![CDATA[<%= content.hqMusicUrl %>]]></HQMusicUrl>
                <ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
            </Music>
        <% } else if(msgType === 'news') { %>
            <ArticleCount><%= content.length %></ArticleCount>
            <Articles>
                <% content.forEach((item) => { %>
                    <item>
                        <Title><![CDATA[<%= content.title %>]]></Title>
                        <Description><![CDATA[<%= content.description %>]]></Description>
                        <PicUrl><![CDATA[<%= content.picurl %>]]></PicUrl>
                        <Url><![CDATA[<%= content.url %>]]></Url>
                    </item>
                <% }) %>
            </Articles>
        <% } %>
    </xml>
    */
});

var compiled = ejs.compile(tpl);

exports = module.exports = {
    compiled: compiled
}