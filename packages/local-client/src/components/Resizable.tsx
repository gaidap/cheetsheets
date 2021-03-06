import './Resizable.css';
import { useState, useEffect } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

export enum Direction {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

interface ResizableProps {
  direction: Direction;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [width, setWidth] = useState(window.innerWidth * 0.75); // set initial width to 75 % of window inner width

  useEffect(() => {
    let timer: any;

    // use debouncing to improve resize performance
    const listener = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        setInnerHeight(window.innerHeight);
        setInnerWidth(window.innerWidth);

        // Solution for ResizableBox bug that ignores maxConstraints if width was set directly
        const editorMaxWidth = window.innerWidth * 0.75;
        if (editorMaxWidth < width) {
          setWidth(editorMaxWidth);
        }
      }, 100);
    };
    window.addEventListener('resize', listener);

    // return clean up funcion to deregister from event the next time width was updated
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [width]);

  let resizableProps: ResizableBoxProps;
  if (direction === Direction.HORIZONTAL) {
    resizableProps = {
      className: 'resize-horizontal',
      minConstraints: [innerWidth * 0.2, Infinity],
      maxConstraints: [innerWidth * 0.75, Infinity],
      height: Infinity,
      width: width,
      resizeHandles: ['e'],
      onResizeStop: (_event, data) => {
        setWidth(data.size.width);
      },
    };
  } else {
    resizableProps = {
      minConstraints: [Infinity, innerHeight * 0.05],
      maxConstraints: [Infinity, innerHeight * 0.9],
      height: 300,
      width: Infinity,
      resizeHandles: ['s'],
    };
  }
  return (
    // Infinity for width works analog to "100%"
    <ResizableBox {...resizableProps}>{children}</ResizableBox>
  );
};

export default Resizable;


