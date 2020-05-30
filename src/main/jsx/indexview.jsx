/*
 * Copyright 2017-2018 Emmanuel Keller / Jaeksoft
 *  <p>
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  <p>
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  <p>
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

'use strict';

const Indexview = (props) => {

  const [error, setError] = useState(null);
  const [task, setTask] = useState(null);
  const [spinning, setSpinning] = useState(false);

  return (
    <div className="p-1 h-100">
      <div className="h-100 d-flex flex-column border bg-light rounded">
        <div className="bg-light text-secondary p-1">INDEXING&nbsp;
          <Status task={task} error={error} spinning={spinning}/>
        </div>
        <div className="flex-grow-1 p-1">
          <textarea className="form-control h-100"
                    style={{resize: 'none'}}
                    value={props.indexJson}
                    onChange={e => props.setIndexJson(e.target.value)}/>
        </div>
        <form className="form-inline pr-1 pb-1">
          <div className="pl-1">
            <SchemaList id="selectSchema"
                        selectedSchema={props.selectedSchema}
                        setSelectedSchema={props.setSelectedSchema}
            />
          </div>
          <div className="pl-1">
            <IndexList id="selectIndex"
                       selectedSchema={props.selectedSchema}
                       selectedIndex={props.selectedIndex}
                       setSelectedIndex={props.setSelectedIndex}
            />
          </div>
          <div className="pt-1 pl-1">
            <button className="btn btn-primary"
                    onClick={() => doIndex()}>
              Post JSON
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  function parseJson() {
    const notParsed = props.indexJson;
    if (notParsed === null || notParsed === '') {
      throw 'Nothing to index';
    }
    return JSON.parse(notParsed);
  }

  function doIndex() {
    if (props.selectedSchema == null || props.selectedSchema === '') {
      setError('Please select a schema.');
      return;
    }
    if (props.selectedIndex == null || props.selectedIndex === '') {
      setError('Please select an index.');
      return;
    }
    setError(null);
    setTask('Parsing...');
    setSpinning(true);
    var parsedJson = null;
    try {
      parsedJson = parseJson();
    } catch (err) {
      setError(err.message);
      setTask(null);
      setSpinning(false);
      return;
    }
    var indexPath;
    if (Array.isArray(parsedJson)) {
      setTask('Indexing ' + Array.length(parseJson) + ' records...');
      indexPath = 'docs';
    } else {
      setTask('Indexing a record...');
      indexPath = 'doc';
    }

    fetchJson(
      '/ws/indexes/' + props.selectedSchema + '/' + props.selectedIndex + '/' + indexPath,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedJson)
      },
      json => {
        console.log(json);
        var msg;
        switch (json) {
          case 0:
            msg = 'Nothing has been indexed.';
            break;
          case 1:
            msg = 'One record has been indexed.';
            break;
          default:
            msg = json + ' records have been indexed.';
            break;
        }
        setTask(msg);
        setSpinning(false);
      },
      error => {
        setError(error);
        setTask(null);
        setSpinning(false);
      });
  }
}
