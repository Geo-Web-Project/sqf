import { useState } from "react";
import { useAccount } from "wagmi";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import FundMatchingPool from "./FundMatchingPool";
import Visualization from "./Visualization";
import FundGrantee from "./FundGrantee";
import SQFIcon from "../assets/sqf.png";
import useAllo from "../hooks/allo";
import useRoundQuery from "../hooks/roundQuery";
import { recipientIds } from "../lib/recipientIds";
import { clampText } from "../lib/utils";
import poolYou from "../lib/pool-you.json";
import poolDirect from "../lib/pool-direct.json";
import poolMatching from "../lib/pool-matching.json";

export type AllocationData = {
  flowRate: `${number}`;
  streamedUntilUpdatedAt: `${number}`;
  updatedAtTimestamp: number;
};

export type MatchingData = {
  totalUnits: `${number}`;
  flowRate: `${number}`;
  totalAmountFlowedDistributedUntilUpdatedAt: `${number}`;
  updatedAtTimestamp: number;
  members: Member[];
};

export type Member = {
  flowRate: `${number}`;
  units: `${number}`;
  totalAmountClaimed: `${number}`;
};

export interface TransactionPanelState {
  show: boolean;
  isMatchingPool: boolean;
  granteeIndex: number | null;
}

export interface Grantee {
  name: string;
  description?: string;
  address?: string;
}

export default function StreamingQuadraticFunding() {
  const [transactionPanelState, setTransactionPanelState] =
    useState<TransactionPanelState>({
      show: false,
      granteeIndex: null,
      isMatchingPool: false,
    });

  const { address } = useAccount();
  const { recipients } = useAllo();
  const { userAllocationData, directAllocationData, matchingData } =
    useRoundQuery(address);

  if (
    !recipients ||
    !userAllocationData ||
    !directAllocationData ||
    !matchingData
  ) {
    return (
      <Spinner
        animation="border"
        role="status"
        className="position-absolute top-50 start-50 text-white"
      ></Spinner>
    );
  }

  return (
    <Container fluid>
      <Row>
        {transactionPanelState.show && transactionPanelState.isMatchingPool && (
          <Col xs="3" className="p-0">
            <FundMatchingPool
              setTransactionPanelState={setTransactionPanelState}
            />
          </Col>
        )}
        <Col xs={transactionPanelState.show ? "9" : 0} className="px-4">
          <Stack direction="vertical" className="justify-content-stretch pt-2">
            <p className="d-flex fs-3 text-aqua mb-0">
              Streaming Quadratic Funding
            </p>
            <p className="text-white fs-4 mb-1">
              A quadratic funding round every second
            </p>
            <p className="text-info fs-5 mb-0">
              Beta Run - January 15 - April 15, 2024
            </p>
          </Stack>
          <Visualization
            transactionPanelState={transactionPanelState}
            setTransactionPanelState={setTransactionPanelState}
            poolYou={poolYou}
            poolDirect={poolDirect}
            poolMatching={poolMatching}
            userAllocationData={userAllocationData}
            directAllocationData={directAllocationData}
            matchingData={matchingData}
          />
        </Col>
        {transactionPanelState.show &&
          transactionPanelState.granteeIndex !== null && (
            <Col xs="3" className="p-0">
              <FundGrantee
                userAllocationData={userAllocationData}
                directAllocationData={directAllocationData}
                matchingData={matchingData}
                granteeIndex={transactionPanelState.granteeIndex}
                setTransactionPanelState={setTransactionPanelState}
                name={poolDirect[transactionPanelState.granteeIndex].name}
                image={SQFIcon}
                website="https://geoweb.network"
                social="https://twitter.com/thegeoweb"
                recipientId={recipientIds[transactionPanelState.granteeIndex]}
                granteeAddress={
                  recipients[transactionPanelState.granteeIndex].superApp
                }
                description={
                  <>
                    {clampText(
                      poolDirect[transactionPanelState.granteeIndex]
                        .description,
                      280
                    )}
                  </>
                }
              />
            </Col>
          )}
      </Row>
    </Container>
  );
}
