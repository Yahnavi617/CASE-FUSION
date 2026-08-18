import { useEffect, useMemo, useState } from 'react';
import { getCaseNetwork } from '../services/api';

function NetworkGraph({ caseId, selectedLead }) {
  const [network, setNetwork] = useState({
    nodes: [],
    edges: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);

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

      if (
        edge.type &&
        !entity.types.includes(edge.type)
      ) {
        entity.types.push(edge.type);
      }
    });

    return Array.from(entityMap.values());
  }, [centerNode, network.nodes, network.edges]);

  const centerConnections = useMemo(() => {
    if (!centerNode) {
      return [];
    }

    return network.edges
      .filter(
        (edge) =>
          edge.source === centerNode.id ||
          edge.target === centerNode.id
      )
      .map((edge) => {
        const connectedId =
          edge.source === centerNode.id
            ? edge.target
            : edge.source;

        const node = network.nodes.find(
          (item) => item.id === connectedId
        );

        return {
          edge,
          node,
        };
      })
      .filter((item) => item.node);
  }, [centerNode, network.edges, network.nodes]);

  useEffect(() => {
    if (!centerNode) {
      setSelectedEntity(null);
      return;
    }

    setSelectedEntity(centerNode);
  }, [centerNode]);

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

    return type || 'Relationship';
  }

  function getNodeType(node) {
    const type =
      node?.type ||
      node?.entityType ||
      node?.category ||
      'person';

    return String(type).toLowerCase();
  }

  function getNodeIcon(node) {
    const type = getNodeType(node);

    if (
      type.includes('device') ||
      type.includes('phone')
    ) {
      return '▣';
    }

    if (
      type.includes('account') ||
      type.includes('bank')
    ) {
      return '¤';
    }

    if (
      type.includes('company') ||
      type.includes('organization')
    ) {
      return '▤';
    }

    return '♙';
  }

  function getEntityStatus(node) {
    return (
      node?.status ||
      node?.state ||
      'Under Surveillance'
    );
  }

  function getEntityLocation(node) {
    return (
      node?.location ||
      node?.address ||
      'Sector 4, NW'
    );
  }

  function getEntityLastActive(node) {
    return (
      node?.lastActive ||
      node?.last_active ||
      node?.lastSeen ||
      '2023-10-27 14:32Z'
    );
  }

  function getPositions(count) {
    if (count === 0) {
      return [];
    }

    if (count === 1) {
      return [
        {
          x: 50,
          y: 18,
        },
      ];
    }

    if (count === 2) {
      return [
        {
          x: 24,
          y: 35,
        },
        {
          x: 76,
          y: 35,
        },
      ];
    }

    if (count === 3) {
      return [
        {
          x: 24,
          y: 42,
        },
        {
          x: 76,
          y: 42,
        },
        {
          x: 76,
          y: 72,
        },
      ];
    }

    if (count === 4) {
      return [
        {
          x: 20,
          y: 30,
        },
        {
          x: 80,
          y: 30,
        },
        {
          x: 80,
          y: 70,
        },
        {
          x: 20,
          y: 70,
        },
      ];
    }

    return connectedEntities.map((_, index) => {
      const angle =
        (Math.PI * 2 * index) /
        Math.max(count, 1);

      return {
        x: 50 + Math.cos(angle) * 34,
        y: 50 + Math.sin(angle) * 34,
      };
    });
  }

  const positions = getPositions(
    connectedEntities.length
  );

  if (loading) {
    return (
      <div className="network-page">
        <div className="network-loading">
          Loading entity network...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="network-page">
        <div className="network-error-state">
          <h2>Unable to load network</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="network-page">

      {/* PAGE HEADER */}

      <div className="network-page-header">

        <div>
          <p className="network-eyebrow">
            NETWORK INTELLIGENCE
          </p>

          <h2>
            Entity Relationship Network
          </h2>

          <p>
            Financial, communication and shared-device
            relationships detected in this case.
          </p>
        </div>

        <div className="network-legend-top">

          <span>
            <i className="legend-dot financial" />
            Financial
          </span>

          <span>
            <i className="legend-dot communication" />
            Communication
          </span>

          <span>
            <i className="legend-dot device" />
            Shared Device
          </span>

        </div>

      </div>

      <div className="network-layout">

        {/* GRAPH */}

        <div className="network-canvas">

          <div className="network-controls">

            <button type="button">
              +
            </button>

            <button type="button">
              −
            </button>

            <button type="button">
              ⛶
            </button>

            <button
              type="button"
              onClick={loadNetwork}
            >
              ↻
            </button>

          </div>

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
                      positions[index];

                    if (!position) {
                      return null;
                    }

                    const type =
                      types[0] || 'default';

                    const midpointX =
                      (50 + position.x) / 2;

                    const midpointY =
                      (50 + position.y) / 2;

                    return (
                      <g
                        key={`${node.id}-edge`}
                      >

                        <line
                          x1="50"
                          y1="50"
                          x2={position.x}
                          y2={position.y}
                          className={`network-line ${getConnectionClass(
                            type
                          )}`}
                        />

                        <circle
                          cx={midpointX}
                          cy={midpointY}
                          r="1.7"
                          className={`network-line-marker ${getConnectionClass(
                            type
                          )}`}
                        />

                      </g>
                    );
                  }
                )}

              </svg>

              {/* CENTER NODE */}

              <button
                type="button"
                className="network-center-node"
                onClick={() =>
                  setSelectedEntity(
                    centerNode
                  )
                }
              >

                <div className="network-node-icon">
                  {getNodeIcon(centerNode)}
                </div>

                <strong>
                  {centerNode.label}
                </strong>

                <span>
                  {centerNode.id}
                </span>

              </button>

              {/* OTHER NODES */}

              {connectedEntities.map(
                ({ node, types }, index) => {
                  const position =
                    positions[index];

                  if (!position) {
                    return null;
                  }

                  const isSelected =
                    selectedEntity?.id ===
                    node.id;

                  return (
                    <button
                      type="button"
                      key={node.id}
                      className={`network-entity-node ${
                        isSelected
                          ? 'selected'
                          : ''
                      }`}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                      onClick={() =>
                        setSelectedEntity(
                          node
                        )
                      }
                    >

                      <div className="network-node-icon">
                        {getNodeIcon(node)}
                      </div>

                      <strong>
                        {node.label}
                      </strong>

                      <span>
                        {node.id}
                      </span>

                    </button>
                  );
                }
              )}

            </>
          ) : (
            <div className="network-empty">
              No entities available.
            </div>
          )}

        </div>

        {/* ENTITY DETAILS */}

        <aside className="network-details">

          <div className="network-details-heading">
            ENTITY DETAILS
          </div>

          {selectedEntity ? (
            <>

              <div className="network-entity-header">

                <div className="network-detail-avatar">
                  {getNodeIcon(
                    selectedEntity
                  )}
                </div>

                <div>

                  <h3>
                    {selectedEntity.label}
                  </h3>

                  <span className="network-entity-id">
                    ID: {selectedEntity.id}
                  </span>

                </div>

                <span className="network-risk-dot" />

              </div>

              <div className="network-property-table">

                <div className="network-property-row">
                  <span>Property</span>
                  <span>Value</span>
                </div>

                <div className="network-property-row">
                  <span>Status</span>

                  <strong className="network-status-value">
                    {getEntityStatus(
                      selectedEntity
                    )}
                  </strong>
                </div>

                <div className="network-property-row">
                  <span>Last Active</span>

                  <strong>
                    {getEntityLastActive(
                      selectedEntity
                    )}
                  </strong>
                </div>

                <div className="network-property-row">
                  <span>Location</span>

                  <strong>
                    {getEntityLocation(
                      selectedEntity
                    )}
                  </strong>
                </div>

              </div>

              <div className="network-connections-title">
                DIRECT CONNECTIONS (
                {centerConnections.length}
                )
              </div>

              <div className="network-connections">

                {centerConnections.length > 0 ? (
                  centerConnections.map(
                    ({
                      edge,
                      node,
                    }) => (
                      <button
                        type="button"
                        className="network-connection-card"
                        key={`${edge.source}-${edge.target}`}
                        onClick={() =>
                          setSelectedEntity(
                            node
                          )
                        }
                      >

                        <strong>
                          {node.label}
                        </strong>

                        <span>
                          {getRelationshipLabel(
                            edge.type
                          )}
                        </span>

                        <b>
                          ›
                        </b>

                      </button>
                    )
                  )
                ) : (
                  <div className="network-no-connections">
                    No direct connections found.
                  </div>
                )}

              </div>

            </>
          ) : (
            <div className="network-no-selection">
              Select an entity to view details.
            </div>
          )}

        </aside>

      </div>

    </div>
  );
}

export default NetworkGraph;