/* eslint-disable @typescript-eslint/no-require-imports */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const devCerts = require("office-addin-dev-certs");

module.exports = async (env, options) => {
  const devMode = options.mode === "development";

  /** @type {import('webpack').Configuration} */
  const config = {
    devtool: devMode ? "inline-source-map" : false,
    entry: {
      taskpane: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.css"],
      viewer: ["./src/viewer/viewer.ts", "./src/viewer/viewer.css"],
      commands: "./src/commands/commands.ts",
      help: ["./src/help/help.ts", "./src/help/help.css"],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/i,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "viewer.html",
        template: "./src/viewer/viewer.html",
        chunks: ["viewer"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["commands"],
      }),
      new HtmlWebpackPlugin({
        filename: "own-site-guide.html",
        template: "./src/help/own-site-guide.html",
        chunks: ["help"],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets",
            to: "assets",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
  };

  if (devMode) {
    config.devServer = {
      headers: { "Access-Control-Allow-Origin": "*" },
      server: {
        type: "https",
        options: env && env.WEBPACK_SERVE
          ? await devCerts.getHttpsServerOptions()
          : {},
      },
      port: 4008,
      hot: true,
    };
  }

  return config;
};
