import React, { useState } from 'react';
import ReactDOM from 'react-dom';
//import ReactModal from 'react-modal-resizable-draggable';
import Draggable from 'react-draggable';
import { apiGetGDCDataById } from '../../api';


const GDCValues = (props) => {
  // let [modalIsOpen, setModalIsOpen] = useState(false);
  // let [gdcValuesState, setGdcValuesState] = useState([]);

  const Modal = (props) => {
    return (
      <Draggable>
        <div>
          <div className="handle">Drag from here</div>
          <div>This readme is really dragging on...</div>
        </div>
      </Draggable>
    );
  };

  // const openModal = event => {
  // apiGetGDCDataById(props.idvalue).then(result => { setGdcValuesState(result); });
  // setModalIsOpen(true);
  //   ReactDOM.render(
  //     <Draggable>
  //       <div>
  //         <div className="handle">Drag from here</div>
  //         <div>This readme is really dragging on...</div>
  //       </div>
  //     </Draggable>, document.getElementById('root'));
  // };
  // const closeModal = event => {
  //   setModalIsOpen(false);
  // };

  // state = {
  //   activeDrags: 0,
  //   deltaPosition: {
  //     x: 0, y: 0
  //   },
  //   controlledPosition: {
  //     x: -400, y: 200
  //   }
  // };

  // handleDrag = (e, ui) => {
  //   const {x, y} = this.state.deltaPosition;
  //   this.setState({
  //     deltaPosition: {
  //       x: x + ui.deltaX,
  //       y: y + ui.deltaY,
  //     }
  //   });
  // };

  return (
    <div>
      <a href="#" onClick={openModal}>See All Values 2</a>
      <Modal />
    </div>
  );

  // return (
  //   <Draggable>
  //     <div>
  //       <div className="handle">Drag from here</div>
  //       <div>This readme is really dragging on...</div>
  //     </div>
  //   </Draggable>
  // );

  // return (
  //   <div>
  //     <button onClick={openModal}>
  //         Open modal
  //     </button>
  //     <ReactModal initWidth={800} initHeight={400}
  //       onRequestClose={closeModal}
  //       isOpen={modalIsOpen}>
  //       <h3>My Modal</h3>
  //       <div className="body">
  //         <pre>{JSON.stringify(gdcValuesState)}</pre>
  //         <p>This is the modal&apos;s body.</p>
  //       </div>
  //       <button onClick={closeModal}>Close modal</button>
  //     </ReactModal>
  //   </div>
  // );
};

export default GDCValues;
