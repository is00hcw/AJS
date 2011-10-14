package com.atlassian.aui.test;


import com.atlassian.plugin.Plugin;
import com.atlassian.plugin.PluginAccessor;
import com.atlassian.plugin.webresource.WebResourceManager;
import org.apache.commons.io.IOUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Writer;
import java.net.URISyntaxException;
import java.net.URL;

/**
 *
 */
public class FuncTestServlet extends HttpServlet {
    private final WebResourceManager webResourceManager;
    private final Plugin plugin;

    public FuncTestServlet(WebResourceManager webResourceManager, PluginAccessor pluginAccessor) {
        this.webResourceManager = webResourceManager;
        this.plugin = pluginAccessor.getPlugin("auiplugin-tests");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        webResourceManager.requireResource("com.atlassian.auiplugin:ajs");

        // conditional resource loading for testing
        if(req.getPathInfo().contains("underscorejs-unit-tests"))
        {
            webResourceManager.requireResource("com.atlassian.auiplugin:ajs-underscorejs");
        }

        if(req.getPathInfo().contains("stalker")){
            webResourceManager.requireResource("com.atlassian.auiplugin:stalker");
        }

        if(req.getPathInfo().contains("page-layout")){
            webResourceManager.requireResource("com.atlassian.auiplugin:aui-experimental-page-layout");
        }
        
        if(req.getPathInfo().contains("buttons")){
            webResourceManager.requireResource("com.atlassian.auiplugin:aui-experimental-buttons");
        }

        if (req.getPathInfo().endsWith("/"))
        {
            try
            {
                displayIndex(req, resp);
            }
            catch (URISyntaxException e)
            {
                throw new IOException(e);
            }
        }
        else
        {
            if(req.getPathInfo().contains("live-demo")){
                webResourceManager.requireResource("auiplugin-tests:live-demo");
            }

            // only include qunit when necessary
            if (req.getPathInfo().contains("unit-tests"))
            {
                webResourceManager.requireResource("auiplugin-tests:qunit");

                String thisPathArray[] = req.getPathInfo().split("/");

                //only require the test resource if we are in a subpath
                if (thisPathArray.length > 4)
                {
                    String thisSubPath = thisPathArray[thisPathArray.length - 2];
                    webResourceManager.requireResource("auiplugin-tests:" + thisSubPath);
                }

                //include all unit test js files if viewing allTests page
                if (thisPathArray[thisPathArray.length - 1].contains("allTests"))
                {
                    webResourceManager.requireResource("auiplugin-tests:all-unit-tests");
                }

            }
            if (req.getPathInfo().contains("test-pages"))
            {
                webResourceManager.requireResource("auiplugin-tests:test-common");
            }
            String path = req.getPathInfo();
            if (path.endsWith(".html"))
            {
                resp.setContentType("text/html");
            }
            else if (path.endsWith(".js"))
            {
                resp.setContentType("text/javascript");
            }
            else if (path.endsWith(".css"))
            {
                resp.setContentType("text/css");
            }
            InputStream in = plugin.getResourceAsStream(path);
            OutputStream out = resp.getOutputStream();
            IOUtils.copy(in, out);
            out.close();
        }
    }

    private void displayIndex(HttpServletRequest req, HttpServletResponse resp) throws IOException, URISyntaxException {
        resp.setContentType("text/html");
        Writer writer = resp.getWriter();
        URL fileURL = plugin.getResource(req.getPathInfo());
        if (fileURL == null)
        {
            resp.sendError(404);
            return;
        }
        else if ("file".equals(fileURL.getProtocol().toLowerCase()))
        {
            File file = new File(fileURL.toURI());
            writer.append("<ul>");
            writer.append("<li><a href=\"../\">..</li>\n");
            for (File kid : file.listFiles())
            {
                String name = kid.getName();
                if (kid.isDirectory())
                {
                    name += "/";
                }
                writer.append("<li><a href=\"" + name + "\">" + name + "</a></li>\n");
            }
            writer.append("</ul>");
            writer.close();
        }
    }
}
