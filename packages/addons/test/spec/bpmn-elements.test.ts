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

import type { ShapeBpmnSemantic } from 'bpmn-visualization';

import { describe, expect, test } from '@jest/globals';
import { ShapeBpmnElementKind } from 'bpmn-visualization';

import { BpmnElementsIdentifier, BpmnElementsSearcher, BpmnVisualization } from '../../src';
import { createNewBpmnVisualizationWithoutContainer } from '../shared/bv-utils';
import { insertBpmnContainerWithoutId } from '../shared/dom-utils';
import { readFileSync } from '../shared/io-utils';

describe('Find elements by providing names', () => {
  const bpmnVisualization = new BpmnVisualization({ container: insertBpmnContainerWithoutId() });
  bpmnVisualization.load(readFileSync('./fixtures/bpmn/search-elements.bpmn'));
  const bpmnElementsSearcher = new BpmnElementsSearcher(bpmnVisualization.bpmnElementsRegistry);

  const expectElementsHavingTheSameName = (bpmnElementIds: string[], expectedName: string): void => {
    for (const bpmnElementId of bpmnElementIds) {
      const elementName = bpmnVisualization.bpmnElementsRegistry.getModelElementsByIds(bpmnElementId).map(element => element.name)[0];
      expect(elementName).toBe(expectedName);
    }
  };

  describe('Retrieve ids only', () => {
    test.each([
      { name: 'start event 1', expectedId: 'StartEvent_1' },
      { name: 'gateway 1', expectedId: 'Gateway_1' },
      { name: 'seq flow 10', expectedId: 'sequenceFlow_10' },
      { name: 'message flow 1', expectedId: 'messageFlow_1' },
    ])('an existing element - $name', ({ name, expectedId }: { name: string; expectedId: string }) => {
      expect(bpmnElementsSearcher.getElementIdByName(name)).toBe(expectedId);
    });

    test('several existing tasks with the same name', () => {
      expectElementsHavingTheSameName(['Task_1', 'UserTask_with_same_name_as_Task_1'], 'task 1 with duplicate name');

      // Retrieve the first one
      expect(bpmnElementsSearcher.getElementIdByName('task 1 with duplicate name')).toBe('Task_1');
    });

    test('several existing sequence flows with the same name', () => {
      expectElementsHavingTheSameName(['sequenceFlow_11', 'sequenceFlow_with_same_name_as_sequenceFlow_11'], 'seq flow 11');

      // Retrieve the first one
      expect(bpmnElementsSearcher.getElementIdByName('seq flow 11')).toBe('sequenceFlow_11');
    });

    test('unknown element', () => {
      expect(bpmnElementsSearcher.getElementIdByName('nobody knows me')).toBeUndefined();
    });
  });

  describe('Retrieve objects', () => {
    test('Several existing tasks with the same name with default options', () => {
      expectElementsHavingTheSameName(['Task_1', 'UserTask_with_same_name_as_Task_1'], 'task 1 with duplicate name');

      // Retrieve the first one
      expect(bpmnElementsSearcher.getElementByName('task 1 with duplicate name')).toEqual({
        id: 'Task_1',
        incomingIds: ['Flow_1yf7yd6'],
        isShape: true,
        kind: ShapeBpmnElementKind.TASK,
        name: 'task 1 with duplicate name',
        outgoingIds: ['Flow_0th6cj1'],
        parentId: 'Participant_1',
      } as ShapeBpmnSemantic);
    });

    test('Several existing tasks with the same name - deduplicate with kinds', () => {
      expectElementsHavingTheSameName(['Task_1', 'UserTask_with_same_name_as_Task_1'], 'task 1 with duplicate name');

      expect(bpmnElementsSearcher.getElementByName('task 1 with duplicate name', { kinds: [ShapeBpmnElementKind.TASK_USER] })).toEqual({
        id: 'UserTask_with_same_name_as_Task_1',
        incomingIds: ['Flow_1a9vtky'],
        isShape: true,
        kind: ShapeBpmnElementKind.TASK_USER,
        name: 'task 1 with duplicate name',
        outgoingIds: ['Flow_0i4ule4', 'Association_0fwvz81'],
        parentId: 'Participant_1',
      } as ShapeBpmnSemantic);
    });

    test('Several existing tasks with the same name - deduplicate with the filtering function', () => {
      expectElementsHavingTheSameName(['Task_1', 'UserTask_with_same_name_as_Task_1'], 'task 1 with duplicate name');

      expect(
        bpmnElementsSearcher.getElementByName('task 1 with duplicate name', {
          filter: bpmnSemantic => bpmnSemantic.isShape && (bpmnSemantic as ShapeBpmnSemantic).outgoingIds.includes('Association_0fwvz81'),
        }),
      ).toEqual({
        id: 'UserTask_with_same_name_as_Task_1',
        incomingIds: ['Flow_1a9vtky'],
        isShape: true,
        kind: ShapeBpmnElementKind.TASK_USER,
        name: 'task 1 with duplicate name',
        outgoingIds: ['Flow_0i4ule4', 'Association_0fwvz81'],
        parentId: 'Participant_1',
      } as ShapeBpmnSemantic);
    });

    test('Several existing tasks with the same name - deduplicate with both kinds and the filtering function', () => {
      expectElementsHavingTheSameName(['TextAnnotation_1', 'TextAnnotation_2', 'Task_with_duplicated_name_with_textAnnotations'], 'Duplicated name on purpose');

      expect(
        bpmnElementsSearcher.getElementByName('Duplicated name on purpose', {
          kinds: [ShapeBpmnElementKind.TEXT_ANNOTATION],
          filter: bpmnSemantic => bpmnSemantic.isShape && (bpmnSemantic as ShapeBpmnSemantic).parentId == 'Participant_2',
        }),
      ).toEqual({
        id: 'TextAnnotation_2',
        incomingIds: ['Association_1ovp59n'],
        isShape: true,
        kind: ShapeBpmnElementKind.TEXT_ANNOTATION,
        name: 'Duplicated name on purpose',
        outgoingIds: [],
        parentId: 'Participant_2',
      } as ShapeBpmnSemantic);
    });
  });
});

describe('Identify elements', () => {
  const bpmnVisualization = createNewBpmnVisualizationWithoutContainer();
  bpmnVisualization.load(readFileSync('./fixtures/bpmn/search-elements.bpmn'));
  const bpmnElementsIdentifier = new BpmnElementsIdentifier(bpmnVisualization.bpmnElementsRegistry);

  test('task', () => {
    const taskId = 'Task_2_1';
    expect(bpmnElementsIdentifier.isActivity(taskId)).toBeTruthy();
    expect(bpmnElementsIdentifier.isBpmnArtifact(taskId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isEvent(taskId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isGateway(taskId)).toBeFalsy();
  });

  test('text annotation', () => {
    const textAnnotationId = 'TextAnnotation_1';
    expect(bpmnElementsIdentifier.isActivity(textAnnotationId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isBpmnArtifact(textAnnotationId)).toBeTruthy();
    expect(bpmnElementsIdentifier.isEvent(textAnnotationId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isGateway(textAnnotationId)).toBeFalsy();
  });

  test('event', () => {
    const eventId = 'StartEvent_1';
    expect(bpmnElementsIdentifier.isActivity(eventId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isBpmnArtifact(eventId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isEvent(eventId)).toBeTruthy();
    expect(bpmnElementsIdentifier.isGateway(eventId)).toBeFalsy();
  });

  test('gateway', () => {
    const gatewayId = 'Gateway_1';
    expect(bpmnElementsIdentifier.isActivity(gatewayId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isBpmnArtifact(gatewayId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isEvent(gatewayId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isGateway(gatewayId)).toBeTruthy();
  });

  test('unknown element', () => {
    const unknownId = 'i_do_not_exist';
    expect(bpmnElementsIdentifier.isActivity(unknownId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isBpmnArtifact(unknownId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isEvent(unknownId)).toBeFalsy();
    expect(bpmnElementsIdentifier.isGateway(unknownId)).toBeFalsy();
  });
});
