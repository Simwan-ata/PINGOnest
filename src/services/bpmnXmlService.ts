/**
 * Standard OMG BPMN 2.0 XML Serialization & Parsing Service
 * Generates and imports standard-compliant BPMN 2.0 XML with DI (Diagram Interchange)
 * Compatible with Camunda Modeler, Signavio, bpmn.io, and PingoNest ST1
 */
import { BpmnProcess, BpmnNode, BpmnLane, BpmnEdge } from '../types/pingonest';

function xmlEscape(val: any): string {
  return String(val == null ? '' : val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function exportProcessToBpmn2Xml(process: BpmnProcess): string {
  const processId = `Process_${process.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const collabId = `Collaboration_${process.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const participantId = `Participant_${process.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const laneSetId = `LaneSet_${process.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  // Map nodes to lanes
  const laneMap = new Map<string, string[]>();
  process.lanes.forEach((l) => laneMap.set(l.id, []));
  process.nodes.forEach((n) => {
    const arr = laneMap.get(n.laneId) || [];
    arr.push(n.id);
    laneMap.set(n.laneId, arr);
  });

  // Generate Lane XML
  const lanesXml = process.lanes
    .map((l) => {
      const nodeRefs = (laneMap.get(l.id) || [])
        .map((nid) => `        <bpmn:flowNodeRef>${xmlEscape(nid)}</bpmn:flowNodeRef>`)
        .join('\n');
      return `      <bpmn:lane id="${xmlEscape(l.id)}" name="${xmlEscape(l.label)}"${
        l.department ? ` pingonest:department="${xmlEscape(l.department)}"` : ''
      }>
${nodeRefs}
      </bpmn:lane>`;
    })
    .join('\n');

  // Generate Node XML
  const nodesXml = process.nodes
    .map((node) => {
      let tagName = 'bpmn:task';
      if (node.type === 'start') tagName = 'bpmn:startEvent';
      else if (node.type === 'end') tagName = 'bpmn:endEvent';
      else if (node.type === 'gateway') {
        if (node.subtype === 'parallel') tagName = 'bpmn:parallelGateway';
        else if (node.subtype === 'inclusive') tagName = 'bpmn:inclusiveGateway';
        else tagName = 'bpmn:exclusiveGateway';
      } else if (node.type === 'task') {
        if (node.subtype === 'user') tagName = 'bpmn:userTask';
        else if (node.subtype === 'service') tagName = 'bpmn:serviceTask';
        else if (node.subtype === 'rule') tagName = 'bpmn:businessRuleTask';
        else if (node.subtype === 'manual') tagName = 'bpmn:manualTask';
        else tagName = 'bpmn:task';
      }

      let subChild = '';
      if (node.subtype === 'timer') subChild = '\n        <bpmn:timerEventDefinition/>';
      if (node.subtype === 'message') subChild = '\n        <bpmn:messageEventDefinition/>';
      if (node.subtype === 'error') subChild = '\n        <bpmn:errorEventDefinition/>';

      const raciAttrs = [
        node.personId ? `pingonest:assignee="${xmlEscape(node.personId)}"` : '',
        node.raci?.responsibleId ? `pingonest:raciR="${xmlEscape(node.raci.responsibleId)}"` : '',
        node.raci?.accountableId ? `pingonest:raciA="${xmlEscape(node.raci.accountableId)}"` : '',
        node.raci?.consultedIds?.length ? `pingonest:raciC="${xmlEscape(node.raci.consultedIds.join(','))}"` : '',
        node.raci?.informedIds?.length ? `pingonest:raciI="${xmlEscape(node.raci.informedIds.join(','))}"` : ''
      ]
        .filter(Boolean)
        .join(' ');

      return `      <${tagName} id="${xmlEscape(node.id)}" name="${xmlEscape(node.label)}" ${raciAttrs}>${subChild}
      </${tagName}>`;
    })
    .join('\n');

  // Generate Edge XML
  const edgesXml = process.edges
    .map((e) => {
      const condXml = e.condition
        ? `\n        <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${xmlEscape(
            e.condition
          )}</bpmn:conditionExpression>`
        : '';
      return `      <bpmn:sequenceFlow id="${xmlEscape(e.id)}" name="${xmlEscape(e.label || '')}" sourceRef="${xmlEscape(
        e.from
      )}" targetRef="${xmlEscape(e.to)}">${condXml}
      </bpmn:sequenceFlow>`;
    })
    .join('\n');

  // Diagram Interchange (BPMNDI)
  const nodeDimensions = (type: string) => {
    if (type === 'task') return { w: 140, h: 65 };
    if (type === 'gateway') return { w: 60, h: 60 };
    return { w: 48, h: 48 };
  };

  const diShapesXml = process.nodes
    .map((n) => {
      const { w, h } = nodeDimensions(n.type);
      return `      <bpmndi:BPMNShape id="${xmlEscape(n.id)}_di" bpmnElement="${xmlEscape(n.id)}">
        <dc:Bounds x="${n.x}" y="${n.y}" width="${w}" height="${h}" />
      </bpmndi:BPMNShape>`;
    })
    .join('\n');

  const diEdgesXml = process.edges
    .map((e) => {
      const source = process.nodes.find((n) => n.id === e.from);
      const target = process.nodes.find((n) => n.id === e.to);
      if (!source || !target) return '';
      const sDim = nodeDimensions(source.type);
      const tDim = nodeDimensions(target.type);
      const sx = source.x + sDim.w / 2;
      const sy = source.y + sDim.h / 2;
      const tx = target.x + tDim.w / 2;
      const ty = target.y + tDim.h / 2;

      return `      <bpmndi:BPMNEdge id="${xmlEscape(e.id)}_di" bpmnElement="${xmlEscape(e.id)}">
        <di:waypoint x="${sx}" y="${sy}" />
        <di:waypoint x="${tx}" y="${ty}" />
      </bpmndi:BPMNEdge>`;
    })
    .filter(Boolean)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:pingonest="https://pingonest.io/schema/bpmn/2.0"
  id="Definitions_PingoNest"
  targetNamespace="https://pingonest.io/bpmn"
  exporter="PingoNest Pro BPMN 2.0 Engine"
  exporterVersion="2.4.0">

  <bpmn:collaboration id="${collabId}">
    <bpmn:participant id="${participantId}" name="${xmlEscape(process.name)}" processRef="${processId}" />
  </bpmn:collaboration>

  <bpmn:process id="${processId}" name="${xmlEscape(process.name)}" isExecutable="true">
    <bpmn:laneSet id="${laneSetId}">
${lanesXml}
    </bpmn:laneSet>

${nodesXml}

${edgesXml}
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${collabId}">
${diShapesXml}
${diEdgesXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}

export function parseBpmn2Xml(xmlString: string): BpmnProcess | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    if (doc.querySelector('parsererror')) {
      return null;
    }

    const processEl = doc.getElementsByTagNameNS('*', 'process')[0] || doc.querySelector('process');
    const processName = processEl?.getAttribute('name') || 'فرایند وارد شده از BPMN 2.0';

    // Parse Lanes
    const laneEls = Array.from(doc.getElementsByTagNameNS('*', 'lane'));
    const lanes: BpmnLane[] = [];
    const nodeToLane = new Map<string, string>();

    if (laneEls.length > 0) {
      laneEls.forEach((l, idx) => {
        const id = l.getAttribute('id') || `lane_${idx + 1}`;
        const label = l.getAttribute('name') || `لِین ${idx + 1}`;
        const department = l.getAttribute('pingonest:department') || l.getAttribute('department') || '';
        lanes.push({ id, label, department });

        const nodeRefs = Array.from(l.getElementsByTagNameNS('*', 'flowNodeRef'));
        nodeRefs.forEach((ref) => {
          const nid = ref.textContent?.trim();
          if (nid) nodeToLane.set(nid, id);
        });
      });
    } else {
      lanes.push({ id: 'lane_default', label: 'لِین پیش‌فرض', department: '' });
    }

    // Parse Shapes / DI Bounds
    const diBounds = new Map<string, { x: number; y: number }>();
    const shapeEls = Array.from(doc.getElementsByTagNameNS('*', 'BPMNShape'));
    shapeEls.forEach((s) => {
      const bpmnElement = s.getAttribute('bpmnElement');
      const bounds = s.getElementsByTagNameNS('*', 'Bounds')[0];
      if (bpmnElement && bounds) {
        diBounds.set(bpmnElement, {
          x: parseFloat(bounds.getAttribute('x') || '100'),
          y: parseFloat(bounds.getAttribute('y') || '100')
        });
      }
    });

    // Parse Nodes
    const nodes: BpmnNode[] = [];
    const nodeTagMap: { [key: string]: { type: BpmnNode['type']; subtype: BpmnNode['subtype'] } } = {
      startEvent: { type: 'start', subtype: 'none' },
      endEvent: { type: 'end', subtype: 'none' },
      task: { type: 'task', subtype: 'none' },
      userTask: { type: 'task', subtype: 'user' },
      serviceTask: { type: 'task', subtype: 'service' },
      businessRuleTask: { type: 'task', subtype: 'rule' },
      manualTask: { type: 'task', subtype: 'manual' },
      exclusiveGateway: { type: 'gateway', subtype: 'exclusive' },
      parallelGateway: { type: 'gateway', subtype: 'parallel' },
      inclusiveGateway: { type: 'gateway', subtype: 'inclusive' }
    };

    Object.entries(nodeTagMap).forEach(([tag, meta]) => {
      const elements = Array.from(doc.getElementsByTagNameNS('*', tag));
      elements.forEach((el, index) => {
        const id = el.getAttribute('id') || `node_${tag}_${index}`;
        const label = el.getAttribute('name') || '';
        const laneId = nodeToLane.get(id) || lanes[0].id;
        const pos = diBounds.get(id) || { x: 180 + index * 120, y: 60 };

        const personId = el.getAttribute('pingonest:assignee') || el.getAttribute('assignee') || '';
        const raciR = el.getAttribute('pingonest:raciR') || personId || undefined;
        const raciA = el.getAttribute('pingonest:raciA') || undefined;
        const raciC = el.getAttribute('pingonest:raciC')?.split(',').filter(Boolean) || [];
        const raciI = el.getAttribute('pingonest:raciI')?.split(',').filter(Boolean) || [];

        nodes.push({
          id,
          type: meta.type,
          subtype: meta.subtype,
          label: label || (meta.type === 'start' ? 'شروع' : meta.type === 'end' ? 'پایان' : 'فعالیت'),
          laneId,
          x: pos.x,
          y: pos.y,
          personId: raciR || personId,
          raci: {
            responsibleId: raciR,
            accountableId: raciA,
            consultedIds: raciC,
            informedIds: raciI
          }
        });
      });
    });

    // Parse Sequence Flows (Edges)
    const edges: BpmnEdge[] = [];
    const flowEls = Array.from(doc.getElementsByTagNameNS('*', 'sequenceFlow'));
    flowEls.forEach((f, idx) => {
      const id = f.getAttribute('id') || `edge_${idx}`;
      const from = f.getAttribute('sourceRef') || '';
      const to = f.getAttribute('targetRef') || '';
      const label = f.getAttribute('name') || '';
      const condEl = f.getElementsByTagNameNS('*', 'conditionExpression')[0];
      const condition = condEl?.textContent?.trim() || undefined;

      if (from && to) {
        edges.push({ id, from, to, label, condition });
      }
    });

    return {
      id: `proc_${Date.now()}`,
      name: processName,
      lanes,
      nodes,
      edges,
      updatedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('BPMN parse error:', err);
    return null;
  }
}
