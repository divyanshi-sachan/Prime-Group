import React, { useState, useEffect } from "react";

const trackingStatuses = [
    { status: "Initiated", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { status: "Confirmed", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { status: "Assigned", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { status: "Completed", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" },
    { status: "Delivered", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" }
];

interface TrackingStatusProps {
  currentStatus: string;
}

const TrackingStatus: React.FC<TrackingStatusProps> = ({ currentStatus }) => {
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentIndex = trackingStatuses.findIndex(
    (status) => status.status === currentStatus
  );
  const displayedStatuses =
    isMobile && !showAll
      ? trackingStatuses.slice(0, Math.max(currentIndex + 1, 2))
      : trackingStatuses;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Tracking Status</h3>
      <div className="flex flex-wrap items-center gap-2 sm:gap-0 sm:justify-between">
        {displayedStatuses.map((status, index) => (
          <div key={status.status} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full ${
                index <= currentIndex ? "bg-blue-500" : "bg-gray-200"
              } flex items-center justify-center`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={status.icon}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <span>{status.status}</span>
          </div>
        ))}
      </div>
      {isMobile && currentIndex < trackingStatuses.length - 1 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-500 hover:text-blue-700 mt-2"
        >
          {showAll ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
};

export default TrackingStatus;
