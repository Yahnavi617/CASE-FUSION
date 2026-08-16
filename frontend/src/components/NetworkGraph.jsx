import { useEffect, useMemo, useState } from 'react';
import { getCaseNetwork } from '../services/api';

function NetworkGraph({ caseId, selectedLead }) {
  const [network, setNetwork] = useState({
    nodes: [],
    edges: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNetwork();
  }, [caseId]);

  async function loadNetwork() {
    try {
      setLoading(true);
      setError('');

      const data = await getCaseNetwork(caseId);

      setNetwork({
        nodes: data.nodes || [],
        edges: data.edges || [],
      });
    } catch (err) {
      console.error('Failed to load network:', err);

      setError(
        err.message || 'Failed to load network graph.'
      );
    } finally {
      setLoading(false);
    }
  }

  const centerNode = useMemo(() => {
    if (selectedLead) {
      const selected = network.nodes.find(
        (node) => node.id === selectedLead.id
      );

      if (selected) {
        return selected;
      }
    }

    return network.nodes[0] || null;
  }, [network.nodes, selectedLead]);

  const connectedEntities = useMemo(() => {
    if (!centerNode) {
      return [];
    }

    const entityMap = new Map();

    network.edges.forEach((edge) => {
      let connectedId = null;

      if (edge.source === centerNode.id) {
        connectedId = edge.target;
      } else if (edge.target === centerNode.id) {
        connectedId = edge.source;
      }

      if (!connectedId) {
        return;
      }

      const node = network.nodes.find(
        (item) => item.id === connectedId
      );

      if (!node) {
        return;
      }

      if (!entityMap.has(connectedId)) {
        entityMap.set(connectedId, {
          node,
          types: [],
        });
      }

      const entity = entityMap.get(connectedId);

      if (!entity.types.includes(edge.type)) {
        entity.types.push(edge.type);
      }
    });

    return Array.from(entityMap.values());
  }, [centerNode, network.nodes, network.edges]);

  const positions = [
    { x: 50, y: 17 },
    { x: 82, y: 35 },
    { x: 82, y: 65 },
    { x: 50, y: 83 },
    { x: 18, y: 65 },
    { x: 18, y: 35 },
  ];

  function getConnectionClass(type) {
    if (type === 'financial') {
      return 'financial';
    }

    if (type === 'communication') {
      return 'communication';
    }

    if (type === 'device') {
      return 'device';
    }

    return 'default';
  }

  function getRelationshipLabel(type) {
    if (type === 'financial') {
      return 'Financial';
    }

    if (type === 'communication') {
      return 'Communication';
    }

    if (type === 'device') {
      return 'Shared Device';
    }

    return type;
  }

  if (loading) {
    return (
      <div className="network-graph">
        <div className="network-title">
          <div>
            <p className="section-label">NETWORK</p>
            <h3>Entity Network</h3>
          </div>
        </div>

        <div className="network-state">
          Loading network...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="network-graph">
        <div className="network-title">
          <div>
            <p className="section-label">NETWORK</p>
            <h3>Entity Network</h3>
          </div>
        </div>

        <div className="network-state network-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="network-graph">
      <div className="network-title">
        <div>
          <p className="section-label">
            NETWORK INTELLIGENCE
          </p>

          <h3>Entity Relationship Network</h3>

          <p className="network-subtitle">
            Financial, communication and shared-device
            relationships detected in this case.
          </p>
        </div>

        <div className="network-counts">
          <span>
            {connectedEntities.length + (centerNode ? 1 : 0)}
            {' '}entities
          </span>

          <span>
            {network.edges.length} connections
          </span>
        </div>
      </div>

      <div className="real-network">
        {centerNode ? (
          <>
            <svg
              className="network-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {connectedEntities.map(
                ({ node, types }, index) => {
                  const position =
                    positions[index % positions.length];

                  const primaryType =
                    types[0] || 'default';

                  return (
                    <line
                      key={`${node.id}-line`}
                      x1="50"
                      y1="50"
                      x2={position.x}
                      y2={position.y}
                      className={`network-edge-svg edge-${getConnectionClass(
                        primaryType
                      )}`}
                    />
                  );
                }
              )}
            </svg>

            <div className="graph-center">
              <div className="graph-node-main">
                <div className="graph-node-kicker">
                  PRIMARY ENTITY
                </div>

                <strong>
                  {centerNode.label}
                </strong>

                <span>
                  {centerNode.id}
                </span>
              </div>
            </div>

            {connectedEntities.map(
              ({ node, types }, index) => {
                const position =
                  positions[index % positions.length];

                return (
                  <div
                    key={node.id}
                    className="graph-entity-position"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                  >
                    <div className="graph-node">
                      <div className="graph-node-type">
                        ENTITY
                      </div>

                      <strong>
                        {node.label}
                      </strong>

                      <span>
                        {node.id}
                      </span>

                      <div className="relationship-tags">
                        {types.map((type) => (
                          <span
                            key={type}
                            className={`relationship-tag tag-${getConnectionClass(
                              type
                            )}`}
                          >
                            {getRelationshipLabel(type)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </>
        ) : (
          <div className="network-state">
            No entities available.
          </div>
        )}
      </div>

      <div className="network-legend">
        <div>
          <span className="legend-dot financial" />
          Financial
        </div>

        <div>
          <span className="legend-dot communication" />
          Communication
        </div>

        <div>
          <span className="legend-dot device" />
          Shared Device
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph;