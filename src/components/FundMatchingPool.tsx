import { useState } from "react";
import { useAccount } from "wagmi";
import Offcanvas from "react-bootstrap/Offcanvas";
import Stack from "react-bootstrap/Stack";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import MatchingPoolDetails from "./MatchingPoolDetails";
import EditStream from "./EditStream";
import { TransactionPanelState } from "./StreamingQuadraticFunding";
import CloseIcon from "../assets/close.svg";
import useSuperfluid from "../hooks/superfluid";
import useAllo from "../hooks/allo";

interface FundMatchingPoolProps {
  setTransactionPanelState: React.Dispatch<
    React.SetStateAction<TransactionPanelState>
  >;
}

export default function FundMatchingPool(props: FundMatchingPoolProps) {
  const { setTransactionPanelState } = props;

  const [flowRateToReceiver, setFlowRateToReceiver] = useState("");
  const [newFlowRate, setNewFlowRate] = useState("");

  const { address } = useAccount();
  const { gdaDistributeFlow, superToken, gdaGetFlowRate } = useSuperfluid(
    "ETHx",
    address
  );
  const { gdaPool } = useAllo();

  const updateFlowRateToReceiver = async () => {
    if (!address || !superToken) {
      return "0";
    }

    const flowRateToReceiver = await gdaGetFlowRate(address);

    setFlowRateToReceiver(flowRateToReceiver);

    return flowRateToReceiver ?? "0";
  };

  const closeOffcanvas = () =>
    setTransactionPanelState({
      show: false,
      isMatchingPool: false,
      granteeIndex: null,
    });

  return (
    <Offcanvas
      show
      scroll
      onHide={closeOffcanvas}
      placement="start"
      backdrop={false}
      className="w-25 bg-dark px-3 overflow-auto border-0 border-top border-secondary"
      style={{ top: 62 }}
    >
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center py-2 text-white"
      >
        <Card.Text className="fs-3 m-0">Fund Matching Pool</Card.Text>
        <Button
          variant="transparent"
          className="position-absolute end-0 px-2 py-0"
          onClick={closeOffcanvas}
        >
          <Image src={CloseIcon} alt="close" width={28} />
        </Button>
      </Stack>
      <Stack
        direction="vertical"
        gap={4}
        className="rounded-4 text-white pb-3 flex-grow-0"
      >
        <MatchingPoolDetails
          flowRateToReceiver={flowRateToReceiver}
          {...props}
        />
        <EditStream
          granteeName="GDA Matching Pool"
          receiver={gdaPool ?? "0x"}
          updateFlowRateToReceiver={updateFlowRateToReceiver}
          flowRateToReceiver={flowRateToReceiver}
          granteeIndex={null}
          newFlowRate={newFlowRate}
          setNewFlowRate={setNewFlowRate}
          isFundingMatchingPool={true}
          transactionsToQueue={[
            async () => await gdaDistributeFlow(newFlowRate),
          ]}
        />
      </Stack>
    </Offcanvas>
  );
}
