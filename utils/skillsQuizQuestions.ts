// utils/skillsQuizQuestions.ts

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const SKILLS_QUIZ_QUESTIONS: Record<string, Record<number, QuizQuestion[]>> = {
  'sk-1': { // eNB / gNB Config & Commissioning
    1: [
      {
        question: "Which optical interface protocol is primarily used for high-bandwidth connectivity between the gNodeB Centralized Unit (CU) and Distributed Unit (DU)?",
        options: ["CPRI v7.0", "eCPRI (Ethernet-based CPRI)", "CPRI-over-OTN", "Common Public Radio Interface v3.0"],
        correctAnswer: "eCPRI (Ethernet-based CPRI)",
        explanation: "eCPRI splits physical layers and encapsulates radio data in Ethernet, dramatically increasing throughput and scalability in 5G RAN."
      },
      {
        question: "When powering on a base station node, which diagnostic step must be verified first before loading parameter scripts?",
        options: ["SFP optical laser path power levels", "Antenna azimuth calibration", "X2 interface heartbeat", "5G Core AMF registration"],
        correctAnswer: "SFP optical laser path power levels",
        explanation: "Hardware level physical connectivity and fiber power budget (laser levels) must be clean to prevent protocol flap errors."
      },
      {
        question: "What is the primary role of the 1PPS signal in telecom clock distribution?",
        options: ["Power amplification trigger", "Phase synchronization timing reference", "User plane payload routing", "Radio channel coding header"],
        correctAnswer: "Phase synchronization timing reference",
        explanation: "One Pulse Per Second (1PPS) ensures tight phase alignment across distributed radio nodes, essential for TDD frame structures."
      }
    ],
    2: [
      {
        question: "What is the main purpose of configuring beam tilt in a Massive MIMO 64T64R antenna array?",
        options: ["Increasing RF coaxial cable physical length", "Optimizing spatial multiplexing and controlling inter-cell interference", "Reducing digital power consumption of the DU", "Splitting physical cells into separate FDD channels"],
        correctAnswer: "Optimizing spatial multiplexing and controlling inter-cell interference",
        explanation: "Adjusting digital and electrical tilt shapes the 3D beams towards user hotspots, keeping energy within the cell boundary and avoiding neighbor interference."
      },
      {
        question: "Which protocol is utilized to transfer and parse configuration XML scripts over the NETCONF session?",
        options: ["SSH / YANG", "Telnet / SNMP", "HTTP / REST", "FTP / TFTP"],
        correctAnswer: "SSH / YANG",
        explanation: "NETCONF operates over SSH and uses YANG data schemas to describe base station configurations securely and structurally."
      },
      {
        question: "During clock synchronization calibration, what phase variance tolerance is acceptable across neighboring TDD sectors?",
        options: ["Less than 1.5 microseconds", "Up to 50 milliseconds", "Within 100 microseconds", "Phase variance has no constraint"],
        correctAnswer: "Less than 1.5 microseconds",
        explanation: "3GPP standard dictates that relative phase alignment must remain within +/- 1.5 microseconds to prevent severe cross-link interference."
      }
    ],
    3: [
      {
        question: "During a 5G Non-Standalone (NSA) EN-DC Option 3x connection, which interface is used for direct control-plane signaling between the anchor 4G eNB and the 5G gNB?",
        options: ["S1-MME", "S1-U", "X2-C", "Ng-C"],
        correctAnswer: "X2-C",
        explanation: "X2 Control Plane (X2-C) manages secondary node addition, modification, and release between 4G and 5G base stations."
      },
      {
        question: "What is the main advantage of O-RAN Split Option 7.2x over standard CPRI?",
        options: ["It completely removes the DU component", "It allows a standard Ethernet-based Fronthaul with logical layer-2 split", "It converts LTE traffic into 5G natively", "It replaces the need for GPS clock synchronization"],
        correctAnswer: "It allows a standard Ethernet-based Fronthaul with logical layer-2 split",
        explanation: "Option 7.2x splits the physical layer, keeping complexity low at the O-RU while dramatically saving fronthaul bandwidth."
      }
    ],
    4: [
      {
        question: "In a zero-touch provisioning (ZTP) pipeline, which protocol is typically used to safely pull golden parameter configuration templates over a secure IPSec backhaul?",
        options: ["FTP", "HTTPS / SFTP", "Telnet", "TFTP"],
        correctAnswer: "HTTPS / SFTP",
        explanation: "Zero-Touch Provisioning systems utilize secure HTTPS or SFTP requests to fetch target software and configurations over IPSec tunnels."
      },
      {
        question: "When a multi-vendor RAN cluster experiences X2 connection setup failures, which parameter is the most common mismatch?",
        options: ["SCTP destination port and IP Security (IPSec) association keys", "Antenna gain tilt index", "Fronthaul optical fiber wavelength", "Paging cycle frame length"],
        correctAnswer: "SCTP destination port and IP Security (IPSec) association keys",
        explanation: "X2 interfaces run over SCTP. Security policy discrepancies or blocked SCTP ports in the firewall cause setup failure."
      }
    ]
  },
  'sk-3': { // 5G NR Radio Access
    1: [
      {
        question: "What is the subcarrier spacing (SCS) for 5G NR numerology mu = 1?",
        options: ["15 kHz", "30 kHz", "60 kHz", "120 kHz"],
        correctAnswer: "30 kHz",
        explanation: "Numerology 1 doubles the baseline 15 kHz spacing (mu = 0) to 30 kHz, shrinking the slot duration to 0.5ms."
      },
      {
        question: "Which of the following describes the SSB (Synchronization Signal Block) transmission interval?",
        options: ["Configurable up to 160ms, with a default of 20ms", "Always fixed at 5ms", "Always fixed at 10ms", "Varies from 1 slot to 1 frame dynamically"],
        correctAnswer: "Configurable up to 160ms, with a default of 20ms",
        explanation: "The SSB periodic window is configurable up to 160ms to save energy, but devices search it every 20ms by default during initial search."
      }
    ],
    2: [
      {
        question: "In the 5G NR random access (RACH) procedure, what is the role of Msg2?",
        options: ["Random Access Preamble", "Random Access Response (RAR)", "RRC Connection Setup Request", "Contention Resolution"],
        correctAnswer: "Random Access Response (RAR)",
        explanation: "Msg2 is the RAR sent by the gNodeB on the DL-SCH, containing the temporary C-RNTI and uplink timing advance."
      },
      {
        question: "Which physical channel carries the Downlink Control Information (DCI) containing scheduling grants?",
        options: ["PDSCH", "PDCCH", "PBCH", "PUCCH"],
        correctAnswer: "PDCCH",
        explanation: "The Physical Downlink Control Channel (PDCCH) carries DCI messages containing resource allocation for downlink and uplink transmissions."
      }
    ],
    3: [
      {
        question: "Which SRS parameter is critical for reciprocity-based Massive MIMO beamforming downlinks?",
        options: ["SRS comb size", "Sounding Reference Signal transmission periodicity", "Uplink channel sounding phase coherence", "CSI-RS feedback delay"],
        correctAnswer: "Uplink channel sounding phase coherence",
        explanation: "Reciprocity relies on uplink SRS phase measurements to predict downlink channel conditions, requiring tight phase coherence."
      },
      {
        question: "Which technology allows 4G LTE and 5G NR to coexist dynamically in the same frequency spectrum block?",
        options: ["FDD Coexistence", "Dynamic Spectrum Sharing (DSS)", "Carrier Aggregation Option 3", "Dual Connectivity (EN-DC)"],
        correctAnswer: "Dynamic Spectrum Sharing (DSS)",
        explanation: "DSS schedules LTE and 5G subcarriers on a millisecond-by-millisecond basis within the exact same channel bandwidth."
      }
    ],
    4: [
      {
        question: "In 5G NR, what is the theoretical maximum bandwidth supported for a single carrier in Frequency Range 2 (FR2)?",
        options: ["100 MHz", "200 MHz", "400 MHz", "800 MHz"],
        correctAnswer: "400 MHz",
        explanation: "FR2 (millimeter-wave) supports channel bandwidths up to 400 MHz on a single carrier component."
      }
    ]
  },
  'sk-6': { // Microservices & Distributed Systems Architecture
    1: [
      {
        question: "Which design pattern is most appropriate for maintaining transaction consistency across decoupled microservices without a shared database?",
        options: ["Two-Phase Commit (2PC)", "Saga Pattern", "Database Sharding", "Outbox Pattern"],
        correctAnswer: "Saga Pattern",
        explanation: "The Saga pattern orchestrates a series of local transactions with compensating rollbacks, avoiding locking resources like in 2PC."
      },
      {
        question: "What is the primary advantage of gRPC over REST with JSON in microservices inter-service communications?",
        options: ["Requires less firewall configuration", "Binary serialization via Protobuf over HTTP/2 for high-speed, compact transport", "Enforces rigid client-side database schemas", "Allows synchronous blocking calls exclusively"],
        correctAnswer: "Binary serialization via Protobuf over HTTP/2 for high-speed, compact transport",
        explanation: "gRPC uses protocol buffers and HTTP/2 stream multiplexing, reducing payload size and latency significantly compared to text-based JSON."
      }
    ],
    2: [
      {
        question: "What happens when a new consumer is added to a Kafka consumer group with fewer partitions than active consumers?",
        options: ["Kafka creates extra partitions dynamically", "The new consumer remains idle and receives no messages", "Kafka multiplexes messages across multiple consumers on the same partition", "A fatal cluster rebalance error is thrown"],
        correctAnswer: "The new consumer remains idle and receives no messages",
        explanation: "Kafka assigns a partition to at most one consumer per group. Any excess consumers over partitions will stay idle."
      },
      {
        question: "To guarantee exactly-once processing in a Kafka producer-consumer pipeline, which configuration is mandatory?",
        options: ["enable.idempotence = true on the producer", "Strict synchronous consumer loops with auto-commit", "Manual database locks on message offsets", "Setting partition count to 1"],
        correctAnswer: "enable.idempotence = true on the producer",
        explanation: "Idempotent producers prevent duplicate writes by appending unique transactional and sequence IDs to message batches."
      }
    ],
    3: [
      {
        question: "In Istio or standard service meshes, which proxy component intercepting pod-to-pod traffic enforces STRICT mutual TLS (mTLS)?",
        options: ["Control Plane Daemon (Istiod)", "Envoy Sidecar Proxy", "Kubernetes API Server", "Ingress Gateway Controller"],
        correctAnswer: "Envoy Sidecar Proxy",
        explanation: "The Envoy sidecar proxy is injected into the application pod, intercepts all network traffic, and validates mTLS certificates peer-to-peer."
      },
      {
        question: "Which pattern is used to track trace propagation context across an asynchronous message queue boundary?",
        options: ["Distributed Saga Context", "W3C Trace Context (traceparent / tracestate headers)", "Jaeger Local Agent Storage", "gRPC Interceptor Metadata"],
        correctAnswer: "W3C Trace Context (traceparent / tracestate headers)",
        explanation: "W3C Trace Context defines standard key headers that are propagated through message headers to stitch distributed asynchronous traces."
      }
    ],
    4: [
      {
        question: "Under the CAP theorem, how does a highly available distributed database handle a network partition?",
        options: ["Returns a database execution error for all read/write queries", "Continues accepting reads and writes locally, sacrificing global consistency", "Replicates all transactions synchronously across partitioned nodes", "Shuts down non-primary nodes immediately"],
        correctAnswer: "Continues accepting reads and writes locally, sacrificing global consistency",
        explanation: "In an AP (Available/Partition-tolerant) system, nodes continue serving requests, which results in temporary data divergence across partitions until synchronization is restored."
      }
    ]
  }
};

// Fallback dynamic question generator
export const getQuizQuestions = (
  skillId: string, 
  sectionNumber: number, 
  skillName: string, 
  sectionTitle: string
): QuizQuestion[] => {
  if (SKILLS_QUIZ_QUESTIONS[skillId] && SKILLS_QUIZ_QUESTIONS[skillId][sectionNumber]) {
    return SKILLS_QUIZ_QUESTIONS[skillId][sectionNumber];
  }
  return [
    {
      question: `What is the primary operational challenge when establishing a robust framework for "${skillName}"?`,
      options: [
        "Scalability limitations and unexpected resource constraints",
        "Upstream carrier electromagnetic interference",
        "Lack of standardized protocol versions globally",
        "Manual parameter verification overhead"
      ],
      correctAnswer: "Scalability limitations and unexpected resource constraints",
      explanation: "Handling variable load and provisioning resources dynamically is the core challenge in modern platform engineering architectures."
    },
    {
      question: `How can practitioners optimize latency and throughput during "${sectionTitle}"?`,
      options: [
        "Introducing localized caching, buffer pools, and asynchronous queuing",
        "Increasing physical network hop distance between compute nodes",
        "Deactivating parallel execution threads to simplify state",
        "Transitioning completely to synchronous REST payload calls"
      ],
      correctAnswer: "Introducing localized caching, buffer pools, and asynchronous queuing",
      explanation: "Caching, queue decoupling, and proper buffer management avoid blocking threads and maximize pipeline throughput."
    },
    {
      question: `Which tool is most commonly utilized by engineering teams to audit performance and trace errors during "${sectionTitle}"?`,
      options: [
        "Enterprise-grade performance benchmark suites and distributed tracing tools",
        "Local spreadsheet tracking models and manual tallies",
        "Text log grep filters run on demand",
        "Manual timing tests with stopwatch tools"
      ],
      correctAnswer: "Enterprise-grade performance benchmark suites and distributed tracing tools",
      explanation: "Automated APM telemetry, distributed tracing (such as OpenTelemetry), and standardized load-testing are standard for performance audits."
    }
  ];
};
