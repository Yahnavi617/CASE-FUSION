import { useEffect, useMemo, useState } from 'react';
import { getCaseNetwork } from '../services/api';
import './EntityRelationshipNetwork.css';

function EntityRelationshipNetwork({
  caseId,
  selectedLead,
}) {
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
      console.error(
        'Failed to load entity relationship network:',
        err
      );

      setError(
        err.message ||
          'Failed to load entity relationship network.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     PRIMARY ENTITY
  ===================================================== */

  const centerNode = useMemo(() => {
    if (selectedLead) {
      const selected = network.nodes.find(
        (node) =>
          node.id === selectedLead.id
      );

      if (selected) {
        return selected;
      }
    }

    return network.nodes[0] || null;
  }, [
    network.nodes,
    selectedLead,
  ]);

  /* =====================================================
     CONNECTED ENTITIES
  ===================================================== */

  const connectedEntities = useMemo(() => {
    if (!centerNode) {
      return [];
    }

    const entityMap = new Map();

    network.edges.forEach((edge) => {
      let connectedId = null;

      if (edge.source === centerNode.id) {
        connectedId = edge.target;
      } else if (
        edge.target === centerNode.id
      ) {
        connectedId = edge.source;
      }

      if (!connectedId) {
        return;
      }

      const node = network.nodes.find(
        (item) =>
          item.id === connectedId
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

      const entity =
        entityMap.get(connectedId);

      if (
        edge.type &&
        !entity.types.includes(edge.type)
      ) {
        entity.types.push(edge.type);
      }
    });

    /*
     * Also include remaining entities
     * returned by API.
     */
    network.nodes.forEach((node) => {
      if (
        node.id === centerNode.id
      ) {
        return;
      }

      if (!entityMap.has(node.id)) {
        entityMap.set(node.id, {
          node,
          types: [],
        });
      }
    });

    return Array.from(
      entityMap.values()
    );
  }, [
    centerNode,
    network.nodes,
    network.edges,
  ]);

  /* =====================================================
     POSITIONS
  ===================================================== */

  function getPositions(count) {
    if (count === 0) {
      return [];
    }

    if (count === 1) {
      return [
        {
          x: 80,
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
          y: 18,
        },
      ];
    }

    if (count === 4) {
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
          x: 82,
          y: 70,
        },
        {
          x: 18,
          y: 70,
        },
      ];
    }

    if (count === 5) {
      return [
        {
          x: 18,
          y: 28,
        },
        {
          x: 82,
          y: 28,
        },
        {
          x: 86,
          y: 68,
        },
        {
          x: 50,
          y: 84,
        },
        {
          x: 14,
          y: 68,
        },
      ];
    }

    if (count === 6) {
      return [
        {
          x: 17,
          y: 25,
        },
        {
          x: 83,
          y: 25,
        },
        {
          x: 88,
          y: 52,
        },
        {
          x: 75,
          y: 78,
        },
        {
          x: 25,
          y: 78,
        },
        {
          x: 12,
          y: 52,
        },
      ];
    }

    const positions = [];

    const radius = 36;

    for (
      let i = 0;
      i < count;
      i += 1
    ) {
      const angle =
        (Math.PI * 2 * i) /
          count -
        Math.PI / 2;

      positions.push({
        x:
          50 +
          Math.cos(angle) *
            radius,

        y:
          50 +
          Math.sin(angle) *
            radius,
      });
    }

    return positions;
  }

  const positions =
    getPositions(
      connectedEntities.length
    );

  /* =====================================================
     RELATIONSHIP HELPERS
  ===================================================== */

  function getConnectionClass(
    type
  ) {
    const value =
      String(type || '')
        .toLowerCase();

    if (
      value.includes('financial') ||
      value.includes('bank')
    ) {
      return 'financial';
    }

    if (
      value.includes('communication') ||
      value.includes('call') ||
      value.includes('social')
    ) {
      return 'communication';
    }

    if (
      value.includes('device') ||
      value.includes('shared')
    ) {
      return 'device';
    }

    return 'default';
  }

  function getRelationshipLabel(
    type
  ) {
    const value =
      String(type || '')
        .toLowerCase();

    if (
      value.includes('financial') ||
      value.includes('bank')
    ) {
      return 'Financial';
    }

    if (
      value.includes('communication') ||
      value.includes('call') ||
      value.includes('social')
    ) {
      return 'Communication';
    }

    if (
      value.includes('device') ||
      value.includes('shared')
    ) {
      return 'Shared Device';
    }

    return type || 'Relationship';
  }

  function getMidpoint(
    position
  ) {
    return {
      x:
        (50 + position.x) / 2,

      y:
        (50 + position.y) / 2,
    };
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <section className="entity-network-card">

        <div className="entity-network-header">

          <div>
            <div className="entity-network-eyebrow">
              NETWORK INTELLIGENCE
            </div>

            <h2>
              Entity Relationship Network
            </h2>

            <p>
              Financial, communication and
              shared-device relationships
              detected in this case.
            </p>
          </div>

        </div>

        <div className="entity-network-state">
          Loading network...
        </div>

      </section>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <section className="entity-network-card">

        <div className="entity-network-header">

          <div>
            <div className="entity-network-eyebrow">
              NETWORK INTELLIGENCE
            </div>

            <h2>
              Entity Relationship Network
            </h2>
          </div>

        </div>

        <div className="entity-network-state entity-network-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={loadNetwork}
          >
            Retry
          </button>
        </div>

      </section>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!centerNode) {
    return (
      <section className="entity-network-card">

        <div className="entity-network-header">

          <div>
            <div className="entity-network-eyebrow">
              NETWORK INTELLIGENCE
            </div>

            <h2>
              Entity Relationship Network
            </h2>

            <p>
              Financial, communication and
              shared-device relationships
              detected in this case.
            </p>
          </div>

        </div>

        <div className="entity-network-state">
          No entities available.
        </div>

      </section>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="entity-network-card">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="entity-network-header">

        <div>

          <div className="entity-network-eyebrow">
            NETWORK INTELLIGENCE
          </div>

          <h2>
            Entity Relationship Network
          </h2>

          <p>
            Financial, communication and
            shared-device relationships
            detected in this case.
          </p>

        </div>

        <div className="entity-network-counts">

          <span>
            {connectedEntities.length + 1}
            {' '}
            entities
          </span>

          <span>
            {network.edges.length}
            {' '}
            connections
          </span>

        </div>

      </div>


      {/* =================================================
          GRAPH
      ================================================= */}

      <div className="entity-network-graph">

        <svg
          className="entity-network-svg"
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

              const type =
                types[0] ||
                'default';

              const connectionClass =
                getConnectionClass(
                  type
                );

              const midpoint =
                getMidpoint(
                  position
                );

              return (
                <g
                  key={`${node.id}-line`}
                >

                  <line
                    x1="50"
                    y1="50"
                    x2={position.x}
                    y2={position.y}
                    className={`entity-edge edge-${connectionClass}`}
                  />

                  <circle
                    cx={midpoint.x}
                    cy={midpoint.y}
                    r="1.9"
                    className={`entity-edge-marker marker-${connectionClass}`}
                  />

                  <circle
                    cx={midpoint.x}
                    cy={midpoint.y}
                    r="0.6"
                    className="entity-edge-marker-inner"
                  />

                </g>
              );
            }
          )}

        </svg>


        {/* =================================================
            CENTER ENTITY
        ================================================= */}

        <div
          className="entity-network-center"
        >

          <div className="entity-center-ring">

            <span>
              PRIMARY ENTITY
            </span>

            <strong>
              {centerNode.label}
            </strong>

            <small>
              {centerNode.id}
            </small>

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
                className="entity-network-node-position"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
              >

                <div className="entity-network-node">

                  <span className="entity-node-label">
                    ENTITY
                  </span>

                  <strong>
                    {node.label}
                  </strong>

                  <small>
                    {node.id}
                  </small>

                  <div className="entity-network-tags">

                    {types.length > 0 ? (
                      types.map(
                        (type) => (
                          <span
                            key={type}
                            className={`entity-tag tag-${getConnectionClass(
                              type
                            )}`}
                          >
                            {getRelationshipLabel(
                              type
                            )}
                          </span>
                        )
                      )
                    ) : (
                      <span className="entity-tag tag-default">
                        Related
                      </span>
                    )}

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>


      {/* =================================================
          LEGEND
      ================================================= */}

      <div className="entity-network-legend">

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

    </section>
  );
}

export default EntityRelationshipNetwork;