import { toPng, toSvg } from 'html-to-image';
import { getRectOfNodes, getNodesBounds, type Node } from 'reactflow';

function downloadImage(dataUrl: string, name: string) {
  const a = document.createElement('a');
  a.setAttribute('download', name);
  a.setAttribute('href', dataUrl);
  a.click();
}

export const exportToPng = async (nodes: Node[]) => {
  if (nodes.length === 0) return;
  const nodesBounds = getNodesBounds(nodes);
  const transform = getRectOfNodes(nodes);
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

  if (viewport) {
    const dataUrl = await toPng(viewport, {
      backgroundColor: '#f8fafc',
      width: transform.width + 100,
      height: transform.height + 100,
      style: {
        width: `${transform.width + 100}px`,
        height: `${transform.height + 100}px`,
        transform: `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px)`,
      },
    });
    downloadImage(dataUrl, 'workflow-diagram.png');
  }
};

export const exportToSvg = async (nodes: Node[]) => {
  if (nodes.length === 0) return;
  const nodesBounds = getNodesBounds(nodes);
  const transform = getRectOfNodes(nodes);
  const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

  if (viewport) {
    const dataUrl = await toSvg(viewport, {
      backgroundColor: '#f8fafc',
      width: transform.width + 100,
      height: transform.height + 100,
      style: {
        width: `${transform.width + 100}px`,
        height: `${transform.height + 100}px`,
        transform: `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px)`,
      },
    });
    downloadImage(dataUrl, 'workflow-diagram.svg');
  }
};
