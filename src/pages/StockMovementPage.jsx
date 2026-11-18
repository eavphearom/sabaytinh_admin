import Button from "../components/ui/Button";
import StockMovementList from "../features/stockMovements/components/StockMovementList";
import useStockMovements from "../features/stockMovements/hooks/useStockMovements";

// Read-only history: no create, edit or delete actions.
export default function StockMovementPage() {
  const movements = useStockMovements();
  return (
    <div className="min-w-0 space-y-5">
      <h1 className="text-[28px] font-semibold text-[#03152B]">
        Stock Movement
      </h1>
      {movements.error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 text-sm text-red-600"
        >
          <p>{movements.error}</p>
          <Button variant="secondary" size="sm" onClick={movements.onRetry}>
            Retry
          </Button>
        </div>
      )}
      <StockMovementList {...movements} />
    </div>
  );
}
