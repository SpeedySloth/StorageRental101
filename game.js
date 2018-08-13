
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'Assets', true, true);
Module['FS_createPath']('/Assets', 'UISprites', true, true);
Module['FS_createPath']('/', 'States', true, true);
Module['FS_createPath']('/States', 'Gamestate', true, true);
Module['FS_createPath']('/', 'UI', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_game.data');

    };
    Module['addRunDependency']('datafile_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 216, "filename": "/client.lua"}, {"audio": 0, "start": 216, "crunched": 0, "end": 442, "filename": "/conf.lua"}, {"audio": 0, "start": 442, "crunched": 0, "end": 683, "filename": "/events.lua"}, {"audio": 0, "start": 683, "crunched": 0, "end": 2284, "filename": "/functions.lua"}, {"audio": 0, "start": 2284, "crunched": 0, "end": 2766, "filename": "/gamedata.lua"}, {"audio": 0, "start": 2766, "crunched": 0, "end": 3750, "filename": "/input.lua"}, {"audio": 0, "start": 3750, "crunched": 0, "end": 4243, "filename": "/main.lua"}, {"audio": 0, "start": 4243, "crunched": 0, "end": 4433, "filename": "/statics.lua"}, {"audio": 0, "start": 4433, "crunched": 0, "end": 15905, "filename": "/Assets/Font.ttf"}, {"audio": 0, "start": 15905, "crunched": 0, "end": 16580, "filename": "/Assets/UISprites/Background.png"}, {"audio": 0, "start": 16580, "crunched": 0, "end": 16730, "filename": "/Assets/UISprites/Button1.png"}, {"audio": 0, "start": 16730, "crunched": 0, "end": 17009, "filename": "/Assets/UISprites/Button2.png"}, {"audio": 0, "start": 17009, "crunched": 0, "end": 17160, "filename": "/Assets/UISprites/Button3.png"}, {"audio": 0, "start": 17160, "crunched": 0, "end": 17535, "filename": "/Assets/UISprites/Button4.png"}, {"audio": 0, "start": 17535, "crunched": 0, "end": 17963, "filename": "/Assets/UISprites/Button5.png"}, {"audio": 0, "start": 17963, "crunched": 0, "end": 18348, "filename": "/Assets/UISprites/Button6.png"}, {"audio": 0, "start": 18348, "crunched": 0, "end": 18476, "filename": "/Assets/UISprites/GreenButton.png"}, {"audio": 0, "start": 18476, "crunched": 0, "end": 18603, "filename": "/Assets/UISprites/RedButton.png"}, {"audio": 0, "start": 18603, "crunched": 0, "end": 19587, "filename": "/States/menustate.lua"}, {"audio": 0, "start": 19587, "crunched": 0, "end": 19811, "filename": "/States/state.lua"}, {"audio": 0, "start": 19811, "crunched": 0, "end": 20451, "filename": "/States/Gamestate/gamestate.lua"}, {"audio": 0, "start": 20451, "crunched": 0, "end": 25813, "filename": "/States/Gamestate/ui.lua"}, {"audio": 0, "start": 25813, "crunched": 0, "end": 26924, "filename": "/UI/button.lua"}, {"audio": 0, "start": 26924, "crunched": 0, "end": 28001, "filename": "/UI/buttonlist.lua"}, {"audio": 0, "start": 28001, "crunched": 0, "end": 33448, "filename": "/UI/clientcard.lua"}, {"audio": 0, "start": 33448, "crunched": 0, "end": 36215, "filename": "/UI/clientcardlist.lua"}, {"audio": 0, "start": 36215, "crunched": 0, "end": 37335, "filename": "/UI/messagebox.lua"}, {"audio": 0, "start": 37335, "crunched": 0, "end": 41444, "filename": "/UI/newclientcard.lua"}, {"audio": 0, "start": 41444, "crunched": 0, "end": 42944, "filename": "/UI/newclientcardlist.lua"}, {"audio": 0, "start": 42944, "crunched": 0, "end": 44355, "filename": "/UI/uiobject.lua"}, {"audio": 0, "start": 44355, "crunched": 0, "end": 44865, "filename": "/UI/uiscreen.lua"}], "remote_package_size": 44865, "package_uuid": "d3b425c9-afec-4943-8619-9885443c1396"});

})();
