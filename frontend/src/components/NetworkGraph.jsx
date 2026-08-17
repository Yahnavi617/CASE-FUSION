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

      console.log("NETWORK NODES:", data.nodes);
      console.log("NETWORK EDGES:", data.edges);

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

    /*
     * Keep existing connected entities first.
     * Then include remaining entities from the API
     * so the complete network is visible.
     */
    network.nodes.forEach((node) => {
      if (node.id === centerNode.id) {
        return;
      }

      if (!entityMap.has(node.id)) {
        entityMap.set(node.id, {
          node,
          types: [],
        });
      }
    });

    return Array.from(entityMap.values());
  }, [
    centerNode,
    network.nodes,
    network.edges,
  ]);

  /*
   * =====================================================
   * CLEAN NETWORK POSITIONS
   * =====================================================
   *
   * Center:
   *             50 / 50
   *
   * 3 entities:
   *
   *             TOP
   *
   * LEFT      CENTER      RIGHT
   *
   * This keeps the graph clean and prevents overlapping.
   */

  function getPositions(count) {
    if (count === 0) {
      return [];
    }

    if (count === 1) {
      return [
        {
          x: 50,
          y: 50,
        },
      ];
    }

    if (count === 2) {
      return [
        {
          x: 20,
          y: 50,
        },
        {
          x: 80,
          y: 50,
        },
      ];
    }

    /*
     * NEW VISUAL POSITIONING
     *
     * For the current 3-entity case:
     *
     * LEFT ENTITY
     *      \
     *       CENTER
     *      /
     * RIGHT ENTITY
     *
     * This matches the clean reference layout.
     */
    if (count === 3) {
      return [
        {
          x: 20,
          y: 50,
        },
        {
          x: 80,
          y: 50,
        },
        {
          x: 50,
          y: 82,
        },
      ];
    }

    if (count === 4) {
      return [
        {
          x: 18,
          y: 35,
        },
        {
          x: 82,
          y: 35,
        },
        {
          x: 82,
          y: 68,
        },
        {
          x: 18,
          y: 68,
        },
      ];
    }

    if (count === 5) {
      return [
        {
          x: 18,
          y: 30,
        },
        {
          x: 82,
          y: 30,
        },
        {
          x: 84,
          y: 70,
        },
        {
          x: 50,
          y: 86,
        },
        {
          x: 16,
          y: 70,
        },
      ];
    }

    return [
      {
        x: 50,
        y: 14,
      },
      {
        x: 84,
        y: 30,
      },
      {
        x: 84,
        y: 70,
      },
      {
        x: 50,
        y: 88,
      },
      {
        x: 16,
        y: 70,
      },
      {
        x: 16,
        y: 30,
      },
    ];
  }

  const positions = getPositions(
    connectedEntities.length
  );

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

  /*
   * Get midpoint of a connection.
   * Used for the small relationship marker.
   */

  function getMidpoint(position) {
    return {
      x: (50 + position.x) / 2,
      y: (50 + position.y) / 2,
    };
  }

  if (loading) {
    return (
      <div className="network-graph">
        <div className="network-title">
          <div>
            <p className="section-label">
              NETWORK
            </p>

            <h3>
              Entity Network
            </h3>
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
            <p className="section-label">
              NETWORK
            </p>

            <h3>
              Entity Network
            </h3>
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

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="network-title">
        <div>
          <p className="section-label">
            NETWORK INTELLIGENCE
          </p>

          <h3>
            Entity Relationship Network
          </h3>

          <p className="network-subtitle">
            Financial, communication and shared-device
            relationships detected in this case.
          </p>
        </div>

        <div className="network-counts">
          <span>
            {connectedEntities.length +
              (centerNode ? 1 : 0)}{' '}
            entities
          </span>

          <span>
            {network.edges.length} connections
          </span>
        </div>
      </div>

      {/* =================================================
          GRAPH
      ================================================= */}

      <div className="real-network">

        {centerNode ? (
          <>

            {/* =================================================
                CONNECTION LINES + RELATIONSHIP MARKERS
            ================================================= */}

            <svg
              className="network-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >

              {connectedEntities.map(
                ({ node, types }, index) => {
                  const position =
                    positions[index];

                  if (!position) {
                    return null;
                  }

                  const primaryType =
                    types[0] || 'default';

                  const connectionClass =
                    getConnectionClass(
                      primaryType
                    );

                  const midpoint =
                    getMidpoint(position);

                  return (
                    <g
                      key={`${node.id}-connection`}
                    >

                      {/* MAIN CONNECTION */}

                      <line
                        x1="50"
                        y1="50"
                        x2={position.x}
                        y2={position.y}
                        className={`network-edge-svg edge-${connectionClass}`}
                      />

                      {/* SMALL CONNECTION MARKER */}

                      <circle
                        cx={midpoint.x}
                        cy={midpoint.y}
                        r="2.1"
                        className={`network-edge-marker marker-${connectionClass}`}
                      />

                      {/* INNER MARKER */}

                      <circle
                        cx={midpoint.x}
                        cy={midpoint.y}
                        r="0.7"
                        className="network-edge-marker-inner"
                      />

                    </g>
                  );
                }
              )}

            </svg>

            {/* =================================================
                CENTER / PRIMARY ENTITY
            ================================================= */}

            <div
              className="graph-center"
              style={{
                left: '50%',
                top: '50%',
                transform:
                  'translate(-50%, -50%)',
              }}
            >
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

            {/* =================================================
                CONNECTED ENTITIES
            ================================================= */}

            {connectedEntities.map(
              ({ node, types }, index) => {
                const position =
                  positions[index];

                if (!position) {
                  return null;
                }

                return (
                  <div
                    key={node.id}
                    className="graph-entity-position"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform:
                        'translate(-50%, -50%)',
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
                            {getRelationshipLabel(
                              type
                            )}
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

      {/* =================================================
          LEGEND
      ================================================= */}

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

        <span className="network-hint">
        </span>

      </div>

    </div>
  );
}

export default NetworkGraph;