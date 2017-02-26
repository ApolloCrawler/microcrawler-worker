'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Simple = exports.Phantom = undefined;

var _PhantomFetcher = require('./PhantomFetcher');

var _PhantomFetcher2 = _interopRequireDefault(_PhantomFetcher);

var _SimpleFetcher = require('./SimpleFetcher');

var _SimpleFetcher2 = _interopRequireDefault(_SimpleFetcher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Phantom = exports.Phantom = _PhantomFetcher2.default;
var Simple = exports.Simple = _SimpleFetcher2.default;