/*
Copyright 2023 Bonitasoft S.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import './assets/path-resolver.css';
import type { BpmnElement } from 'bpmn-visualization';

import { BpmnVisualization, ElementsPlugin, PathResolver, ShapeUtil, StylePlugin } from '@process-analytics/bpmn-visualization-addons';
import { FitType } from 'bpmn-visualization';

import { fetchDiagram } from './shared/diagrams.js';

// Instantiate BpmnVisualization, pass the container HTMLElement - present in path-resolver.html
const bpmnVisualization = new BpmnVisualization({
  container: 'bpmn-container',
  plugins: [ElementsPlugin, StylePlugin],
});
// Load the BPMN diagram defined above
const diagram = await fetchDiagram();
bpmnVisualization.load(diagram, { fit: { type: FitType.Center, margin: 20 } });
const elementsPlugin = bpmnVisualization.getPlugin<ElementsPlugin>('elements');
const stylePlugin = bpmnVisualization.getPlugin<StylePlugin>('style');

const pathResolver = new PathResolver(elementsPlugin);

const selectedBpmnElements = new Set<string>();
const registerSelectedBpmnElement = (id: string): boolean => {
  if (selectedBpmnElements.has(id)) {
    return false;
  }
  selectedBpmnElements.add(id);
  return true;
};
const computedFlows: string[] = [];

function computePath(): void {
  // reset style of previously computed flows
  stylePlugin.resetStyle(computedFlows);
  computedFlows.length = 0;

  const visitedEdges = pathResolver.getVisitedEdges([...selectedBpmnElements]);
  computedFlows.push(...visitedEdges);
  stylePlugin.updateStyle(computedFlows, { stroke: { color: 'orange', width: 3 } });
}

function clearPath(): void {
  stylePlugin.resetStyle([...selectedBpmnElements, ...computedFlows]);
  selectedBpmnElements.clear();
  computedFlows.length = 0;
}

const getAllFlowNodes = (): BpmnElement[] => elementsPlugin.getElementsByKinds(ShapeUtil.flowNodeKinds().filter(kind => !ShapeUtil.isBpmnArtifact(kind)));

const setupBpmnElementEventHandlers = (): void => {
  for (const item of getAllFlowNodes()) {
    const currentId = item.bpmnSemantic.id;
    const htmlElement = item.htmlElement;
    htmlElement.addEventListener('click', () => {
      if (registerSelectedBpmnElement(currentId)) {
        stylePlugin.updateStyle(currentId, { stroke: { color: 'blue' }, fill: { color: 'lightblue' } });
      } else {
        selectedBpmnElements.delete(currentId);
        stylePlugin.resetStyle(currentId);
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    htmlElement.addEventListener('mouseenter', _event => {
      htmlElement.style.cursor = 'pointer';
    });
  }
};

const setupControlEventHandlers = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  document.querySelector('#btn-compute-path')?.addEventListener('click', _event => {
    computePath();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  document.querySelector('#bt-clear')?.addEventListener('click', _event => {
    clearPath();
  });
};

setupControlEventHandlers();
setupBpmnElementEventHandlers();
