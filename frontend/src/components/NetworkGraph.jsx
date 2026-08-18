import { useEffect, useMemo, useState } from 'react';
import { getCaseNetwork } from '../services/api';
import './NetworkGraph.css';

function NetworkGraph({ caseId, selectedLead }) {
  const [network, setNetwork] = useState({
    nodes: [],
    edges: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);

  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadNetwork();
  }, [caseId]);

  async function loadNetwork() {
    try {
      setLoading(true);
      setError('');

      const data = await getCaseNetwork(caseId);

      const nodes = data?.nodes || [];
      const edges = data?.edges || [];

      setNetwork({
        nodes,
        edges,
      });

      if (selectedLead) {
        const selected = nodes.find(
          (node) => node.id === selectedLead.id
        );

        setSelectedEntity(selected || nodes[0] || null);
      } else {
        setSelectedEntity(nodes[0] || null);
      }
    } catch (err) {
      console.error('Failed to load network:', err);

      setError(
        err?.message || 'Failed to load network intelligence.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     CENTER ENTITY
  ====================================================== */

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

  /* =====================================================
     CONNECTED ENTITIES
  ====================================================== */

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
  }, [
    centerNode,
    network.nodes,
    network.edges,
  ]);

  /* =====================================================
     CONNECTIONS
  ====================================================== */

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
  }, [
    centerNode,
    network.edges,
    network.nodes,
  ]);

  /* =====================================================
     SELECT DEFAULT ENTITY
  ====================================================== */

  useEffect(() => {
    if (!selectedEntity && centerNode) {
      setSelectedEntity(centerNode);
    }
  }, [centerNode, selectedEntity]);

  /* =====================================================
     HELPERS
  ====================================================== */

  function getNodeType(node) {
    return String(
      node?.type ||
        node?.entityType ||
        node?.category ||
        'person'
    ).toLowerCase();
  }

  function getEntityLocation(node) {
    return (
      node?.location ||
      node?.address ||
      '48.8566° N, 2.3522° E'
    );
  }

  function getEntityLastActive(node) {
    return (
      node?.lastActive ||
      node?.last_active ||
      node?.lastSeen ||
      '2023-10-27 14:08:00Z'
    );
  }

  function getEntityStatus(node) {
    return (
      node?.status ||
      node?.state ||
      'Under Surveillance'
    );
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

  function getConnectionType(types = []) {
    const value = String(types[0] || '').toLowerCase();

    if (value.includes('financial')) {
      return 'financial';
    }

    if (value.includes('communication')) {
      return 'communication';
    }

    if (value.includes('device')) {
      return 'device';
    }

    return 'default';
  }

  function getRelationshipLabel(type) {
    const value = String(type || '').toLowerCase();

    if (value.includes('financial')) {
      return 'Wire Transfer';
    }

    if (value.includes('communication')) {
      return 'Communication';
    }

    if (value.includes('device')) {
      return 'Device Ping';
    }

    return type || 'Relationship';
  }

  function getMarkerClass(node, types = []) {
    const type = getNodeType(node);
    const relation = getConnectionType(types);

    if (
      type.includes('device') ||
      type.includes('phone') ||
      relation === 'device'
    ) {
      return 'device';
    }

    if (
      type.includes('account') ||
      type.includes('bank') ||
      relation === 'financial'
    ) {
      return 'financial';
    }

    return 'entity';
  }

  /* =====================================================
     MAP POSITIONS
  ====================================================== */

  const mapPositions = useMemo(() => {
    const fallback = [
      {
        left: '57%',
        top: '31%',
      },
      {
        left: '64%',
        top: '46%',
      },
      {
        left: '38%',
        top: '62%',
      },
      {
        left: '47%',
        top: '76%',
      },
      {
        left: '70%',
        top: '65%',
      },
    ];

    return connectedEntities.map(
      (_, index) =>
        fallback[index] || {
          left: `${25 + ((index * 17) % 55)}%`,
          top: `${25 + ((index * 23) % 50)}%`,
        }
    );
  }, [connectedEntities]);

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="network-page">
        <div className="network-loading">
          Loading location intelligence...
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ====================================================== */

  if (error) {
    return (
      <div className="network-page">
        <div className="network-error-state">
          <h2>Unable to load network</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={loadNetwork}
            className="network-retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div className="network-page">

      {/* ===============================================
          MAP
      ================================================ */}

      <section className="network-map-panel">

        {/* MAP CONTROLS */}

        <div className="network-map-controls">

          <button
            type="button"
            onClick={() =>
              setZoom((value) =>
                Math.min(value + 0.15, 1.6)
              )
            }
          >
            +
          </button>

          <button
            type="button"
            onClick={() =>
              setZoom((value) =>
                Math.max(value - 0.15, 0.75)
              )
            }
          >
            −
          </button>

          <button
            type="button"
            onClick={() => setZoom(1)}
          >
            ◇
          </button>

          <button
            type="button"
            onClick={loadNetwork}
          >
            ↻
          </button>

        </div>

        {/* MAP */}

        <div
          className="network-map"
          style={{
            '--map-zoom': zoom,
          }}
        >

          <div className="map-grid" />

          <div className="map-glow map-glow-one" />
          <div className="map-glow map-glow-two" />

          {/* Stylized continent shapes */}

          <div className="continent continent-europe" />
          <div className="continent continent-africa" />
          <div className="continent continent-asia" />

          {/* Connection lines */}

          <svg
            className="network-map-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {connectedEntities.map(
              ({ node, types }, index) => {
                const position =
                  mapPositions[index];

                if (!position) {
                  return null;
                }

                const left =
                  parseFloat(position.left);

                const top =
                  parseFloat(position.top);

                const type =
                  getConnectionType(types);

                return (
                  <g key={`${node.id}-${index}`}>

                    <line
                      x1="50"
                      y1="43"
                      x2={left}
                      y2={top}
                      className={`map-connection-line ${type}`}
                    />

                    <circle
                      cx={(50 + left) / 2}
                      cy={(43 + top) / 2}
                      r="0.8"
                      className={`map-line-dot ${type}`}
                    />

                  </g>
                );
              }
            )}
          </svg>

          {/* CENTER MARKER */}

          {centerNode && (
            <button
              type="button"
              className="map-marker entity center-marker"
              onClick={() =>
                setSelectedEntity(centerNode)
              }
              title={centerNode.label}
            >
              <span className="marker-pulse" />
              <span className="marker-dot" />
            </button>
          )}

          {/* OTHER MARKERS */}

          {connectedEntities.map(
            ({ node, types }, index) => {
              const position =
                mapPositions[index];

              if (!position) {
                return null;
              }

              const markerClass =
                getMarkerClass(node, types);

              const isSelected =
                selectedEntity?.id === node.id;

              return (
                <button
                  type="button"
                  key={node.id}
                  className={`map-marker ${markerClass} ${
                    isSelected ? 'selected' : ''
                  }`}
                  style={{
                    left: position.left,
                    top: position.top,
                  }}
                  onClick={() =>
                    setSelectedEntity(node)
                  }
                  title={node.label}
                >
                  <span className="marker-pulse" />
                  <span className="marker-symbol">
                    {markerClass === 'financial'
                      ? '◆'
                      : markerClass === 'device'
                        ? '□'
                        : '●'}
                  </span>
                </button>
              );
            }
          )}

          {/* MAP LABELS */}

          <span className="map-label label-europe">
            EUROPE
          </span>

          <span className="map-label label-africa">
            AFRICA
          </span>

          <span className="map-label label-middle-east">
            MIDDLE EAST
          </span>

          {/* LEGEND */}

          <div className="network-map-legend">

            <div className="legend-title">
              MAP LEGEND
            </div>

            <div className="legend-item">
              <span className="legend-marker entity" />
              Entity Location
            </div>

            <div className="legend-item">
              <span className="legend-marker financial" />
              Transaction Node
            </div>

            <div className="legend-item">
              <span className="legend-marker device" />
              Device Ping
            </div>

          </div>

        </div>
      </section>


      {/* ===============================================
          LOCATION INTELLIGENCE
      ================================================ */}

      <aside className="network-intelligence-panel">

        <div className="network-intelligence-header">

          <h2>
            Location Intelligence
          </h2>

          <button
            type="button"
            onClick={loadNetwork}
            title="Refresh"
          >
            ≡
          </button>

        </div>


        {selectedEntity ? (
          <div className="intelligence-content">

            {/* ENTITY SIGHTING */}

            <article className="intel-card entity-card">

              <div className="intel-card-top">

                <span className="intel-type entity">
                  <i />
                  ENTITY SIGHTING
                </span>

                <button
                  type="button"
                  className="intel-open"
                  onClick={() =>
                    setSelectedEntity(
                      selectedEntity
                    )
                  }
                >
                  ↗
                </button>

              </div>

              <h3>
                {selectedEntity.label ||
                  'Target Alpha-X'}
              </h3>

              <div className="intel-grid">

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {getEntityLocation(
                      selectedEntity
                    )}
                  </strong>
                </div>

                <div>
                  <span>TIME (UTC)</span>
                  <strong>
                    {getEntityLastActive(
                      selectedEntity
                    )}
                  </strong>
                </div>

              </div>

              <div className="confidence-label">
                <span>Confidence</span>
                <strong>87%</strong>
              </div>

              <div className="confidence-bar">
                <span style={{ width: '87%' }} />
              </div>

            </article>


            {/* CONNECTION CARDS */}

            {centerConnections
              .slice(0, 3)
              .map(
                ({
                  edge,
                  node,
                }) => {

                  const relation =
                    String(
                      edge.type || ''
                    ).toLowerCase();

                  let cardType = 'financial';

                  if (
                    relation.includes(
                      'device'
                    )
                  ) {
                    cardType = 'device';
                  } else if (
                    relation.includes(
                      'communication'
                    )
                  ) {
                    cardType =
                      'communication';
                  }

                  return (
                    <article
                      className={`intel-card ${cardType}-card`}
                      key={`${edge.source}-${edge.target}`}
                      onClick={() =>
                        setSelectedEntity(
                          node
                        )
                      }
                    >

                      <div className="intel-card-top">

                        <span
                          className={`intel-type ${cardType}`}
                        >
                          <i />
                          {getRelationshipLabel(
                            edge.type
                          ).toUpperCase()}
                        </span>

                      </div>

                      <h3>
                        {node.label}
                      </h3>

                      <div className="intel-grid">

                        <div>
                          <span>
                            ROUTING / ID
                          </span>

                          <strong>
                            {node.id}
                          </strong>
                        </div>

                        <div>
                          <span>
                            STATUS
                          </span>

                          <strong>
                            {getEntityStatus(
                              node
                            )}
                          </strong>
                        </div>

                      </div>

                    </article>
                  );
                }
              )}

          </div>
        ) : (
          <div className="network-no-selection">
            No location intelligence available.
          </div>
        )}

      </aside>

    </div>
  );
}

export default NetworkGraph;