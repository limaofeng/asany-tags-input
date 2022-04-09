import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Tag from '../src/Tag';

const App = () => {
  return (
    <div>
      <Tag />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
