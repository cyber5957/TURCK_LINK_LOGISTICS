import { useEffect, useState } from "react";
import { ownerAPI, customerAPI } from "../api";

export function OwnerDashboard({ theme, onToggleTheme, t, onToggleLanguage, language, onLogout, goToHash, ThemeToggle, LanguageToggle }) {
  const [dashboardData, setDashboardData] = useState({
    trucks: 0,
    activeBookings: 0,
    totalEarnings: 0
  });
  const [trucks, setTrucks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddTruckForm, setShowAddTruckForm] = useState(false);
  const [addingTruck, setAddingTruck] = useState(false);
  const [truckFormMessage, setTruckFormMessage] = useState('');
  const [truckFormError, setTruckFormError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardError(false);
      const [dashboardRes, trucksRes, bookingsRes] = await Promise.all([
        ownerAPI.getDashboard(),
        ownerAPI.getTrucks(),
        ownerAPI.getBookings()
      ]);

      setDashboardData({
        trucks: dashboardRes.data.trucks,
        activeBookings: dashboardRes.data.activeBookings,
        totalEarnings: dashboardRes.data.totalEarnings
      });
      setTrucks(trucksRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.basePrice = Number(data.basePrice);
    data.features = (data.features || '')
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean);

    try {
      setAddingTruck(true);
      setTruckFormMessage('');
      setTruckFormError(false);
      await ownerAPI.addTruck(data);
      await fetchDashboardData();
      form.reset();
      setTruckFormMessage(t('Truck added successfully. You can add another truck below.'));
    } catch (err) {
      console.error('Error adding truck:', err);
      setTruckFormError(true);
      setTruckFormMessage(err.response?.data?.message || t('Could not add the truck. Check the details and try again.'));
    } finally {
      setAddingTruck(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await ownerAPI.updateBookingStatus(bookingId, { status: newStatus });
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Error updating booking status.');
    }
  };

  const handleToggleTruckAvailability = async (truck) => {
    try {
      await ownerAPI.updateTruckAvailability(truck._id, !truck.availability);
      await fetchDashboardData();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Could not update truck availability.');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return t("Pending Confirmation");
      case 'confirmed': return t("Confirmed");
      case 'in_transit': return t("In Transit");
      case 'delivered': return t("Delivered");
      case 'cancelled': return t("Cancelled");
      default: return status;
    }
  };

  return (
    <div className="page-shell dashboard-page dashboard-page--owner">
      <header className="subpage-topbar dashboard-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            {"\u2190"} {t("Back to homepage")}
          </button>
          <button type="button" className="btn btn-outline" onClick={onLogout}>{t("Logout")}</button>
          <LanguageToggle language={language} onToggle={onToggleLanguage} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">{t("Owner dashboard")}</p>
          <h1>{t("Manage your fleet and leads")}</h1>
          <p className="dashboard-intro">A clear view of your trucks, booking requests, and fleet activity.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary dashboard-header-action"
          onClick={() => {
            setActiveTab('fleet');
            setShowAddTruckForm(true);
            setTruckFormMessage('');
          }}
        >
          {t("+ Add New Truck")}
        </button>
      </header>

      <main>
        <nav className="dashboard-tabs" aria-label={t("Owner dashboard sections")}>
          <div className="tabs-container">
            <button
              type="button"
              aria-current={activeTab === 'overview' ? 'page' : undefined}
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t("Overview")}
            </button>
            <button
              type="button"
              aria-current={activeTab === 'fleet' ? 'page' : undefined}
              className={`tab-button ${activeTab === 'fleet' ? 'active' : ''}`}
              onClick={() => setActiveTab('fleet')}
            >
              {t("Fleet Management")}
            </button>
            <button
              type="button"
              aria-current={activeTab === 'bookings' ? 'page' : undefined}
              className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              {t("Bookings")}
            </button>
          </div>
        </nav>

        {loading && (
          <div className="dashboard-message" role="status">
            <span className="dashboard-message-indicator" aria-hidden="true" />
            {t("Loading your fleet workspace...")}
          </div>
        )}
        {dashboardError && (
          <div className="dashboard-message dashboard-message--error" role="alert">
            <div>
              <strong>{t("Your fleet data is temporarily unavailable")}</strong>
              <p>{t("Please try again in a moment. Your dashboard will update when the connection is restored.")}</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={fetchDashboardData}>
              {t("Try again")}
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && !dashboardError && (
          <div className="dashboard-content">
            <section className="fleet-header">
              <div>
                <h3>{t("Fleet at a glance")}</h3>
                <p>{t("Your key fleet and booking numbers, all in one place.")}</p>
              </div>
            </section>
            <section className="overview-stats">
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{1F69A}"}</div>
                <div className="stat-info">
                  <h3>{dashboardData.trucks}</h3>
                  <p>{t("Total Trucks")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{1F4E6}"}</div>
                <div className="stat-info">
                  <h3>{dashboardData.activeBookings}</h3>
                  <p>{t("Active Bookings")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{1F4B0}"}</div>
                <div className="stat-info">
                  <h3>{"\u20B9"}{dashboardData.totalEarnings.toLocaleString("en-IN")}</h3>
                  <p>{t("Total Earnings")}</p>
                </div>
              </div>
            </section>

            <section className="recent-activity">
              <div className="dashboard-section-heading">
                <div>
                  <h3>{t("Recent Bookings")}</h3>
                  <p>{t("Latest customer requests and their current status.")}</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('bookings')}>
                  {t("View all bookings")}
                </button>
              </div>
              <div className="activity-list">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking._id} className="activity-item">
                    <div className="activity-info">
                      <strong>{booking.truck?.truckNumber}</strong>
                      <span>{booking.customer?.name}</span>
                      <small>{booking.pickupLocation} {"\u2192"} {booking.deliveryLocation}</small>
                    </div>
                    <div className="activity-status">
                      <span
                        className={`status-badge status-${booking.status}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="dashboard-empty-state">
                    <span className="dashboard-empty-icon" aria-hidden="true">↗</span>
                    <div>
                      <strong>{t("No booking requests yet")}</strong>
                      <p>{t("New customer requests will appear here so you can review and respond.")}</p>
                    </div>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveTab('fleet')}>
                      {t("Review your fleet")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Fleet Management Tab */}
        {activeTab === 'fleet' && !loading && !dashboardError && (
          <div className="dashboard-content">
            <section className="fleet-header">
              <h3>{t("Your Fleet")}</h3>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAddTruckForm(!showAddTruckForm);
                  setTruckFormMessage('');
                }}
              >
                {showAddTruckForm ? t("Cancel") : t("+ Add New Truck")}
              </button>
            </section>

            {truckFormMessage && <p className={`form-feedback${truckFormError ? ' is-error' : ''}`} role="status">{truckFormMessage}</p>}

            {showAddTruckForm && (
              <section className="add-truck-form">
                <form onSubmit={handleAddTruck}>
                  <div className="form-grid">
                    <label className="field-group">
                      <span>{t("Truck Number")}</span>
                      <input type="text" name="truckNumber" placeholder="e.g., TRK-001" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Truck Type")}</span>
                      <select name="truckType" required>
                        <option value="">{t("Select type")}</option>
                        <option value="Open truck">{t("Open truck")}</option>
                        <option value="Container">{t("Container")}</option>
                        <option value="Cold chain">{t("Cold chain")}</option>
                        <option value="Express delivery">{t("Express delivery")}</option>
                      </select>
                    </label>
                    <label className="field-group">
                      <span>{t("Capacity")}</span>
                      <input type="text" name="capacity" placeholder="e.g., 10 tons" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Route")}</span>
                      <input type="text" name="route" placeholder="e.g., Delhi to Jaipur" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Base Price (\u20B9)")}</span>
                      <input type="number" name="basePrice" placeholder="5000" required />
                    </label>
                    <label className="field-group">
                      <span>{t("Features (comma separated)")}</span>
                      <input type="text" name="features" placeholder="GPS tracking, Refrigerated" />
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={addingTruck}>
                    {addingTruck ? t("Adding truck...") : t("Add Truck")}
                  </button>
                </form>
              </section>
            )}

            <section className="fleet-list">
              <div className="trucks-grid">
                {trucks.map(truck => (
                  <div key={truck._id} className="truck-card">
                    <div className="truck-header">
                      <h4>{truck.truckNumber}</h4>
                      <span className={`availability ${truck.availability ? 'available' : 'unavailable'}`}>
                        {truck.availability ? t("Available") : t("Busy")}
                      </span>
                    </div>
                    <div className="truck-details">
                      <p><strong>{t("Type")}:</strong> {truck.truckType}</p>
                      <p><strong>{t("Capacity")}:</strong> {truck.capacity}</p>
                      <p><strong>{t("Route")}:</strong> {truck.route}</p>
                      <p><strong>{t("Price")}:</strong> {"\u20B9"}{truck.basePrice}</p>
                      {truck.features && truck.features.length > 0 && (
                        <p><strong>{t("Features")}:</strong> {truck.features.join(', ')}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline small"
                      onClick={() => handleToggleTruckAvailability(truck)}
                    >
                      {truck.availability ? 'Mark unavailable' : 'Mark available'}
                    </button>
                  </div>
                ))}
                {trucks.length === 0 && !showAddTruckForm && (
                  <div className="dashboard-empty-state dashboard-empty-state--wide">
                    <span className="dashboard-empty-icon" aria-hidden="true">+</span>
                    <div>
                      <strong>{t("Your fleet starts here")}</strong>
                      <p>{t("Add your first truck to make it available for shipment requests.")}</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setShowAddTruckForm(true)}>
                      {t("Add your first truck")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && !loading && !dashboardError && (
          <div className="dashboard-content">
            <section className="bookings-header">
              <h3>{t("Booking Management")}</h3>
            </section>

            <section className="bookings-list">
              <div className="bookings-table">
                <div className="table-header">
                  <span>{t("Customer")}</span>
                  <span>{t("Truck")}</span>
                  <span>{t("Route")}</span>
                  <span>{t("Status")}</span>
                  <span>{t("Price")}</span>
                  <span>{t("Actions")}</span>
                </div>
                {bookings.map(booking => (
                  <div key={booking._id} className="table-row">
                    <div className="customer-info">
                      <strong>{booking.customer?.name}</strong>
                      <small>{booking.customer?.email}</small>
                      {booking.contactPhone && <small>{booking.contactPhone}</small>}
                    </div>
                    <div>{booking.truck?.truckNumber}</div>
                    <small>{booking.pickupLocation} {"\u2192"} {booking.deliveryLocation}</small>
                    <div>
                      <span
                        className={`status-badge status-${booking.status}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div>{"\u20B9"}{booking.price}</div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <button
                          className="btn-small btn-confirm"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                        >
                          {t("Confirm")}
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          className="btn-small btn-start"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'in_transit')}
                        >
                          {t("Start Trip")}
                        </button>
                      )}
                      {booking.status === 'in_transit' && (
                        <button
                          className="btn-small btn-deliver"
                          onClick={() => handleUpdateBookingStatus(booking._id, 'delivered')}
                        >
                          {t("Mark Delivered")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="dashboard-empty-state dashboard-empty-state--wide">
                    <span className="dashboard-empty-icon" aria-hidden="true">↗</span>
                    <div>
                      <strong>{t("No bookings to manage")}</strong>
                      <p>{t("When a customer sends a request for your fleet, it will be ready for review here.")}</p>
                    </div>
                    <button type="button" className="btn btn-outline" onClick={() => setActiveTab('fleet')}>
                      {t("Go to fleet")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
export function CustomerDashboard({ theme, onToggleTheme, t, onToggleLanguage, language, onLogout, goToHash, ThemeToggle, LanguageToggle }) {
  const [dashboardData, setDashboardData] = useState({
    user: { name: '', email: '', phone: '' },
    stats: { totalBookings: 0, activeBookings: 0, completedBookings: 0, totalSpent: 0 },
    recentBookings: []
  });
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardError(false);
      const [dashboardRes, bookingsRes] = await Promise.all([
        customerAPI.getDashboard(),
        customerAPI.getBookings()
      ]);

      setDashboardData(dashboardRes.data);
      setAllBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      await customerAPI.updateProfile(data);
      fetchDashboardData(); // Refresh data
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile.');
    }
  };

  const handleAddReview = async (bookingId) => {
    try {
      await customerAPI.addReview({
        bookingId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      setShowReviewForm(null);
      setReviewData({ rating: 5, comment: '' });
      fetchDashboardData();
      alert('Review added successfully!');
    } catch (err) {
      console.error('Error adding review:', err);
      alert('Error adding review.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await customerAPI.cancelBooking(bookingId);
      fetchDashboardData();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Error cancelling booking.');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Confirmation';
      case 'confirmed': return 'Confirmed';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="page-shell dashboard-page dashboard-page--customer">
      <header className="subpage-topbar dashboard-topbar">
        <div className="subpage-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => goToHash("/")}
          >
            {"\u2190"} {t("Back to homepage")}
          </button>
          <button type="button" className="btn btn-outline" onClick={onLogout}>{t("Logout")}</button>
          <LanguageToggle language={language} onToggle={onToggleLanguage} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} language={language} />
        </div>

        <div className="subpage-copy">
          <p className="eyebrow">{t("Customer dashboard")}</p>
          <h1>{t("Manage your shipments")}</h1>
          <p className="dashboard-intro">{t("Track booking requests, review shipment details, and keep your account up to date.")}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary dashboard-header-action"
          onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}
        >
          {t("Book a Shipment")}
        </button>
      </header>

      <main>
        <nav className="dashboard-tabs" aria-label={t("Customer dashboard sections")}>
          <div className="tabs-container">
            <button
              type="button"
              aria-current={activeTab === 'overview' ? 'page' : undefined}
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t("Overview")}
            </button>
            <button
              type="button"
              aria-current={activeTab === 'bookings' ? 'page' : undefined}
              className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              {t("My Bookings")}
            </button>
            <button
              type="button"
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              {t("Profile")}
            </button>
          </div>
        </nav>

        {loading && (
          <div className="dashboard-message" role="status">
            <span className="dashboard-message-indicator" aria-hidden="true" />
            {t("Loading your shipment workspace...")}
          </div>
        )}
        {dashboardError && (
          <div className="dashboard-message dashboard-message--error" role="alert">
            <div>
              <strong>{t("Your shipment data is temporarily unavailable")}</strong>
              <p>{t("Please try again in a moment. Your dashboard will update when the connection is restored.")}</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={fetchDashboardData}>
              {t("Try again")}
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && !dashboardError && (
          <div className="dashboard-content">
            <section className="overview-stats">
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{1F4E6}"}</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.totalBookings}</h3>
                  <p>{t("Total Bookings")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{1F69A}"}</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.activeBookings}</h3>
                  <p>{t("Active Shipments")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{2705}"}</div>
                <div className="stat-info">
                  <h3>{dashboardData.stats.completedBookings}</h3>
                  <p>{t("Completed")}</p>
                </div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon">{"\u{1F4B0}"}</div>
                <div className="stat-info">
                  <h3>{"\u20B9"}{dashboardData.stats.totalSpent.toLocaleString("en-IN")}</h3>
                  <p>{t("Total Spent")}</p>
                </div>
              </div>
            </section>

            <section className="recent-activity">
              <div className="dashboard-section-heading">
                <div>
                  <h3>{t("Recent Bookings")}</h3>
                  <p>{t("A quick view of your latest shipment activity.")}</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => setActiveTab('bookings')}>
                  {t("View all bookings")}
                </button>
              </div>
              <div className="activity-list">
                {dashboardData.recentBookings.map(booking => (
                  <div key={booking._id} className="activity-item">
                    <div className="activity-info">
                      <strong>{booking.truck?.truckNumber} - {booking.truck?.truckType}</strong>
                      <span><strong>{t("Route")}:</strong> {booking.pickupLocation} {"\u2192"} {booking.deliveryLocation}</span>
                      <small>{"\u20B9"}{booking.price} · {new Date(booking.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="activity-status">
                      <span
                        className={`status-badge status-${booking.status}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                ))}
                {dashboardData.recentBookings.length === 0 && (
                  <div className="dashboard-empty-state">
                    <span className="dashboard-empty-icon" aria-hidden="true">↗</span>
                    <div>
                      <strong>{t("Your next shipment starts here")}</strong>
                      <p>{t("Book a truck when you are ready. Your request and updates will appear here.")}</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}>
                      {t("Book a Shipment")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && !loading && !dashboardError && (
          <div className="dashboard-content">
            <section className="bookings-section">
              <h3>{t("All My Bookings")}</h3>
              <div className="bookings-list">
                {allBookings.map(booking => (
                  <div key={booking._id} className="booking-card-detailed">
                    <div className="booking-header">
                      <div className="booking-title">
                        <h4>{booking.truck?.truckNumber} - {booking.truck?.truckType}</h4>
                        <span className="booking-date">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="booking-price">
                        <strong>{"\u20B9"}{booking.price}</strong>
                        <span
                          className={`status-badge status-${booking.status}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <span><strong>{t("Route")}:</strong> {booking.pickupLocation} {"\u2192"} {booking.deliveryLocation}</span>
                        <span><strong>{t("Cargo")}:</strong> {booking.cargoType} ({booking.weight})</span>
                      </div>
                      <div className="detail-row">
                        <span><strong>{t("Pickup Date")}:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</span>
                        <span><strong>{t("Instructions")}:</strong> {booking.specialInstructions || 'None'}</span>
                      </div>
                    </div>

                    <div className="booking-actions">
                      {booking.status === 'delivered' && !booking.review && (
                        <button
                          className="btn-small btn-primary"
                          onClick={() => setShowReviewForm(booking._id)}
                        >
                          {t("Write Review")}
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          {t("Cancel Booking")}
                        </button>
                      )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm === booking._id && (
                      <div className="review-form">
                        <h5>{t("Write a Review")}</h5>
                        <div className="rating-input">
                          <label>{t("Rating")}:</label>
                          <select
                            value={reviewData.rating}
                            onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                          >
                            <option value={5}>{"\u2605\u2605\u2605\u2605\u2605"} (5 stars)</option>
                            <option value={4}>{"\u2605\u2605\u2605\u2605"} (4 stars)</option>
                            <option value={3}>{"\u2605\u2605\u2605"} (3 stars)</option>
                            <option value={2}>{"\u2605\u2605"} (2 stars)</option>
                            <option value={1}>{"\u2605"} (1 star)</option>
                          </select>
                        </div>
                        <textarea
                          placeholder={t("Share your experience...")}
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                          rows={3}
                        />
                        <div className="review-actions">
                          <button
                            className="btn-small btn-primary"
                            onClick={() => handleAddReview(booking._id)}
                          >
                            {t("Submit Review")}
                          </button>
                          <button
                            className="btn-small btn-outline"
                            onClick={() => setShowReviewForm(null)}
                          >
                            {t("Cancel")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {allBookings.length === 0 && (
                  <div className="dashboard-empty-state dashboard-empty-state--wide">
                    <span className="dashboard-empty-icon" aria-hidden="true">↗</span>
                    <div>
                      <strong>{t("No shipments yet")}</strong>
                      <p>{t("Your booking requests, shipment details, and status updates will appear here.")}</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => goToHash("/truck-map", { flow: "Instant booking" })}>
                      {t("Book your first shipment")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && !loading && !dashboardError && (
          <div className="dashboard-content">
            <section className="profile-section">
              <h3>{t("My Profile")}</h3>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-grid">
                  <label className="field-group">
                    <span>{t("Full Name")}</span>
                    <input
                      type="text"
                      name="name"
                      defaultValue={dashboardData.user.name}
                      required
                    />
                  </label>
                  <label className="field-group">
                    <span>{t("Email Address")}</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={dashboardData.user.email}
                      disabled
                    />
                  </label>
                  <label className="field-group">
                    <span>{t("Phone Number")}</span>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={dashboardData.user.phone}
                    />
                  </label>
                </div>
                <button type="submit" className="btn btn-primary">
                  {t("Update Profile")}
                </button>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
