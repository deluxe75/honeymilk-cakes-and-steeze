#include <QApplication>
#include <QMainWindow>
#include <QTabWidget>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QFormLayout>
#include <QLabel>
#include <QLineEdit>
#include <QTextEdit>
#include <QComboBox>
#include <QSpinBox>
#include <QPushButton>
#include <QGroupBox>
#include <QMessageBox>
#include <QDateEdit>
#include <QTextStream>
#include <QFile>
#include <QDir>
#include <QStandardPaths>
#include <QDate>
#include <QDateTime>
#include <QMap>
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonValue>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QEventLoop>

namespace {

struct CustomerOrder {
    QString customerName;
    QString phone;
    QString email;
    QString cakeType;
    QString flavor;
    QString size;
    int quantity = 1;
    double price = 0.0;
    QString deliveryType;
    QString notes;
    QString orderDate;
};

struct FeedbackEntry {
    QString customerName;
    QString email;
    int rating = 5;
    QString message;
    QString submittedAt;
};

QString dataDirectoryPath() {
    QString dir = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/honeymilk-desktop";
    QDir().mkpath(dir);
    return dir;
}

QJsonArray readJsonArray(const QString &filePath) {
    QFile file(filePath);
    if (!file.exists() || !file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        return {};
    }

    QByteArray data = file.readAll();
    file.close();

    QJsonParseError error;
    QJsonDocument doc = QJsonDocument::fromJson(data, &error);
    if (error.error != QJsonParseError::NoError || !doc.isArray()) {
        return {};
    }

    return doc.array();
}

void saveJsonArray(const QString &filePath, const QJsonArray &array) {
    QFile file(filePath);
    if (file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QTextStream out(&file);
        out << QJsonDocument(array).toJson(QJsonDocument::Indented);
        file.close();
    }
}

bool submitOrderToBackend(const CustomerOrder &order) {
    QJsonObject payload;
    payload["customer_name"] = order.customerName;
    payload["customer_phone"] = order.phone;
    payload["customer_email"] = order.email;
    payload["customer_whatsapp"] = order.phone;
    payload["delivery_type"] = (order.deliveryType == "Delivery") ? "delivery" : "pickup";
    payload["delivery_date"] = order.orderDate;
    payload["delivery_time_slot"] = "12:00 PM - 3:00 PM";
    payload["special_instructions"] = order.notes;
    payload["payment_method"] = "paystack";

    QJsonArray items;
    QJsonObject item;
    item["product_id"] = 1;
    item["name"] = order.cakeType;
    item["size"] = order.size;
    item["flavor"] = order.flavor;
    item["filling"] = "Whipped Honeycomb Buttercream";
    item["addons"] = QJsonArray();
    item["quantity"] = order.quantity;
    item["notes"] = order.notes;
    items.append(item);
    payload["items"] = items;

    QNetworkAccessManager manager;
    QNetworkRequest request(QUrl("http://localhost:3000/api/orders"));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    QNetworkReply *reply = manager.post(request, QJsonDocument(payload).toJson(QJsonDocument::Compact));
    QEventLoop loop;
    QObject::connect(reply, &QNetworkReply::finished, &loop, &QEventLoop::quit);
    loop.exec();

    QByteArray response = reply->readAll();
    const bool ok = reply->error() == QNetworkReply::NoError;
    reply->deleteLater();

    if (!ok) {
        return false;
    }

    QJsonParseError error;
    const QJsonDocument doc = QJsonDocument::fromJson(response, &error);
    if (error.error != QJsonParseError::NoError || !doc.isObject()) {
        return false;
    }

    const QJsonObject obj = doc.object();
    return obj.value("success").toBool();
}

bool submitFeedbackToBackend(const FeedbackEntry &entry) {
    QJsonObject payload;
    payload["author_name"] = entry.customerName;
    payload["location"] = "Lagos, Nigeria";
    payload["rating"] = entry.rating;
    payload["comment"] = entry.message;

    QNetworkAccessManager manager;
    QNetworkRequest request(QUrl("http://localhost:3000/api/reviews"));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    QNetworkReply *reply = manager.post(request, QJsonDocument(payload).toJson(QJsonDocument::Compact));
    QEventLoop loop;
    QObject::connect(reply, &QNetworkReply::finished, &loop, &QEventLoop::quit);
    loop.exec();

    QByteArray response = reply->readAll();
    const bool ok = reply->error() == QNetworkReply::NoError;
    reply->deleteLater();

    if (!ok) {
        return false;
    }

    QJsonParseError error;
    const QJsonDocument doc = QJsonDocument::fromJson(response, &error);
    if (error.error != QJsonParseError::NoError || !doc.isObject()) {
        return false;
    }

    const QJsonObject obj = doc.object();
    return obj.value("success").toBool();
}

void saveOrder(const CustomerOrder &order) {
    const QString filePath = dataDirectoryPath() + "/orders.json";
    QJsonArray orders = readJsonArray(filePath);

    QJsonObject obj;
    obj["customerName"] = order.customerName;
    obj["phone"] = order.phone;
    obj["email"] = order.email;
    obj["cakeType"] = order.cakeType;
    obj["flavor"] = order.flavor;
    obj["size"] = order.size;
    obj["quantity"] = order.quantity;
    obj["price"] = QString::number(order.price, 'f', 2);
    obj["deliveryType"] = order.deliveryType;
    obj["notes"] = order.notes;
    obj["orderDate"] = order.orderDate;
    obj["createdAt"] = QDateTime::currentDateTime().toString(Qt::ISODateWithMs);

    orders.append(obj);
    saveJsonArray(filePath, orders);
}

void saveFeedback(const FeedbackEntry &entry) {
    const QString filePath = dataDirectoryPath() + "/feedback.json";
    QJsonArray feedback = readJsonArray(filePath);

    QJsonObject obj;
    obj["customerName"] = entry.customerName;
    obj["email"] = entry.email;
    obj["rating"] = entry.rating;
    obj["message"] = entry.message;
    obj["submittedAt"] = entry.submittedAt;

    feedback.append(obj);
    saveJsonArray(filePath, feedback);
}

double estimateCakePrice(const QString &cakeType, const QString &size) {
    QMap<QString, double> basePrices;
    basePrices["Golden Honeycomb Velvet"] = 48000.0;
    basePrices["Steeze Pistachio & Cardamom Noir"] = 54000.0;
    basePrices["Midnight Valrhona & Espresso Ganache"] = 46000.0;
    basePrices["Red Velvet Steeze & Cream Cheese Silk"] = 45000.0;
    basePrices["Custom Cake"] = 65000.0;

    const double base = basePrices.value(cakeType, 50000.0);
    if (size == "Mini") return base * 0.65;
    if (size == "Standard") return base;
    if (size == "Large") return base * 1.4;
    if (size == "Wedding Tier") return base * 2.0;
    return base;
}

}  // namespace

class OrderForm : public QWidget {
public:
    explicit OrderForm(QWidget *parent = nullptr) : QWidget(parent) {
        auto *root = new QVBoxLayout(this);
        root->setContentsMargins(20, 20, 20, 20);
        root->setSpacing(18);

        auto *titleBar = new QWidget(this);
        auto *titleLayout = new QVBoxLayout(titleBar);
        titleLayout->setContentsMargins(0, 0, 0, 0);

        auto *brand = new QLabel("HoneyMilk Bakery");
        QFont brandFont = brand->font();
        brandFont.setPointSize(24);
        brandFont.setBold(true);
        brand->setFont(brandFont);
        brand->setStyleSheet("color: #2C221E;");

        auto *subtitle = new QLabel("Custom order request");
        subtitle->setStyleSheet("color: #735A4B; font-size: 12px;");

        titleLayout->addWidget(brand);
        titleLayout->addWidget(subtitle);
        root->addWidget(titleBar);

        auto *panel = new QGroupBox("Order Details");
        auto *formLayout = new QFormLayout(panel);
        formLayout->setFieldGrowthPolicy(QFormLayout::AllNonFixedFieldsGrow);
        formLayout->setHorizontalSpacing(18);
        formLayout->setVerticalSpacing(12);

        nameEdit = new QLineEdit();
        phoneEdit = new QLineEdit();
        emailEdit = new QLineEdit();
        cakeCombo = new QComboBox();
        cakeCombo->addItems({
            "Golden Honeycomb Velvet",
            "Steeze Pistachio & Cardamom Noir",
            "Midnight Valrhona & Espresso Ganache",
            "Red Velvet Steeze & Cream Cheese Silk",
            "Custom Cake"
        });

        flavorEdit = new QLineEdit("Vanilla Bean");
        sizeCombo = new QComboBox();
        sizeCombo->addItems({"Mini", "Standard", "Large", "Wedding Tier"});
        quantitySpin = new QSpinBox();
        quantitySpin->setRange(1, 50);
        deliveryCombo = new QComboBox();
        deliveryCombo->addItems({"Pickup", "Delivery"});
        dateEdit = new QDateEdit(QDate::currentDate());
        notesEdit = new QTextEdit();
        notesEdit->setPlaceholderText("Any message, allergies, custom design details, or pickup notes");
        notesEdit->setMaximumHeight(110);
        priceLabel = new QLabel("₦0.00");
        priceLabel->setStyleSheet("font-size: 18px; font-weight: bold; color: #B38528;");

        formLayout->addRow("Customer Name", nameEdit);
        formLayout->addRow("Phone", phoneEdit);
        formLayout->addRow("Email", emailEdit);
        formLayout->addRow("Cake Type", cakeCombo);
        formLayout->addRow("Flavor", flavorEdit);
        formLayout->addRow("Size", sizeCombo);
        formLayout->addRow("Quantity", quantitySpin);
        formLayout->addRow("Delivery", deliveryCombo);
        formLayout->addRow("Pickup / Delivery Date", dateEdit);
        formLayout->addRow("Estimated Price", priceLabel);
        formLayout->addRow("Notes", notesEdit);

        root->addWidget(panel);

        auto *buttonRow = new QHBoxLayout();
        auto *primaryButton = new QPushButton("Place Order");
        primaryButton->setStyleSheet(
            "QPushButton { background: #2C221E; color: white; border: none; border-radius: 10px; padding: 10px 18px; font-weight: bold; }"
            "QPushButton:hover { background: #3B2516; }"
        );

        auto *secondaryButton = new QPushButton("Clear Form");
        secondaryButton->setStyleSheet(
            "QPushButton { background: #F3E8D6; color: #2C221E; border: none; border-radius: 10px; padding: 10px 18px; font-weight: bold; }"
        );

        buttonRow->addStretch();
        buttonRow->addWidget(primaryButton);
        buttonRow->addWidget(secondaryButton);
        root->addLayout(buttonRow);

        connect(cakeCombo, &QComboBox::currentTextChanged, this, &OrderForm::updatePriceEstimate);
        connect(sizeCombo, &QComboBox::currentTextChanged, this, &OrderForm::updatePriceEstimate);
        connect(quantitySpin, QOverload<int>::of(&QSpinBox::valueChanged), this, &OrderForm::updatePriceEstimate);
        connect(primaryButton, &QPushButton::clicked, this, &OrderForm::submitOrder);
        connect(secondaryButton, &QPushButton::clicked, this, &OrderForm::clearForm);

        updatePriceEstimate();
    }

private slots:
    void updatePriceEstimate() {
        const double total = estimateCakePrice(cakeCombo->currentText(), sizeCombo->currentText()) * quantitySpin->value();
        priceLabel->setText(QString("₦%1").arg(total, 0, 'f', 2));
    }

    void clearForm() {
        nameEdit->clear();
        phoneEdit->clear();
        emailEdit->clear();
        flavorEdit->setText("Vanilla Bean");
        notesEdit->clear();
        quantitySpin->setValue(1);
        deliveryCombo->setCurrentIndex(0);
        dateEdit->setDate(QDate::currentDate());
        updatePriceEstimate();
    }

    void submitOrder() {
        const QString name = nameEdit->text().trimmed();
        const QString phone = phoneEdit->text().trimmed();
        const QString email = emailEdit->text().trimmed();

        if (name.isEmpty() || phone.isEmpty() || email.isEmpty()) {
            QMessageBox::warning(this, "Missing Customer Details", "Please fill in name, phone, and email before placing the order.");
            return;
        }

        CustomerOrder order;
        order.customerName = name;
        order.phone = phone;
        order.email = email;
        order.cakeType = cakeCombo->currentText();
        order.flavor = flavorEdit->text().trimmed();
        order.size = sizeCombo->currentText();
        order.quantity = quantitySpin->value();
        order.deliveryType = deliveryCombo->currentText();
        order.notes = notesEdit->toPlainText().trimmed();
        order.orderDate = dateEdit->date().toString("yyyy-MM-dd");
        order.price = estimateCakePrice(order.cakeType, order.size) * order.quantity;

        const bool online = submitOrderToBackend(order);
        if (!online) {
            saveOrder(order);
            QMessageBox::information(
                this,
                "Order Saved Locally",
                "The bakery API was not reachable, so your request was saved on this device.\n\nEstimated total: ₦" + QString::number(order.price, 'f', 2)
            );
        } else {
            QMessageBox::information(
                this,
                "Order Submitted",
                "Thank you, " + order.customerName + ".\nYour order request was sent to the bakery successfully.\nEstimated total: ₦" + QString::number(order.price, 'f', 2)
            );
        }
        clearForm();
    }

private:
    QLineEdit *nameEdit = nullptr;
    QLineEdit *phoneEdit = nullptr;
    QLineEdit *emailEdit = nullptr;
    QComboBox *cakeCombo = nullptr;
    QLineEdit *flavorEdit = nullptr;
    QComboBox *sizeCombo = nullptr;
    QSpinBox *quantitySpin = nullptr;
    QComboBox *deliveryCombo = nullptr;
    QDateEdit *dateEdit = nullptr;
    QTextEdit *notesEdit = nullptr;
    QLabel *priceLabel = nullptr;
};

class FeedbackForm : public QWidget {
public:
    explicit FeedbackForm(QWidget *parent = nullptr) : QWidget(parent) {
        auto *root = new QVBoxLayout(this);
        root->setContentsMargins(20, 20, 20, 20);
        root->setSpacing(18);

        auto *title = new QLabel("Customer Feedback");
        QFont font = title->font();
        font.setPointSize(24);
        font.setBold(true);
        title->setFont(font);
        title->setStyleSheet("color: #2C221E;");
        root->addWidget(title);

        auto *panel = new QGroupBox("Share your experience");
        auto *formLayout = new QFormLayout(panel);
        formLayout->setHorizontalSpacing(18);
        formLayout->setVerticalSpacing(12);

        nameEdit = new QLineEdit();
        emailEdit = new QLineEdit();
        ratingBox = new QComboBox();
        ratingBox->addItems({"5 - Excellent", "4 - Very Good", "3 - Good", "2 - Fair", "1 - Poor"});
        messageEdit = new QTextEdit();
        messageEdit->setPlaceholderText("Tell us how we did and what we can improve");
        messageEdit->setMaximumHeight(140);

        formLayout->addRow("Your Name", nameEdit);
        formLayout->addRow("Email", emailEdit);
        formLayout->addRow("Rating", ratingBox);
        formLayout->addRow("Message", messageEdit);

        root->addWidget(panel);

        auto *buttonRow = new QHBoxLayout();
        auto *submitButton = new QPushButton("Submit Feedback");
        submitButton->setStyleSheet(
            "QPushButton { background: #B38528; color: white; border: none; border-radius: 10px; padding: 10px 18px; font-weight: bold; }"
            "QPushButton:hover { background: #A6761D; }"
        );

        auto *clearButton = new QPushButton("Clear");
        clearButton->setStyleSheet(
            "QPushButton { background: #F3E8D6; color: #2C221E; border: none; border-radius: 10px; padding: 10px 18px; font-weight: bold; }"
        );

        buttonRow->addStretch();
        buttonRow->addWidget(submitButton);
        buttonRow->addWidget(clearButton);
        root->addLayout(buttonRow);

        connect(submitButton, &QPushButton::clicked, this, &FeedbackForm::submitFeedback);
        connect(clearButton, &QPushButton::clicked, this, &FeedbackForm::clearForm);
    }

private slots:
    void clearForm() {
        nameEdit->clear();
        emailEdit->clear();
        ratingBox->setCurrentIndex(0);
        messageEdit->clear();
    }

    void submitFeedback() {
        const QString name = nameEdit->text().trimmed();
        const QString email = emailEdit->text().trimmed();
        const QString message = messageEdit->toPlainText().trimmed();

        if (name.isEmpty() || email.isEmpty() || message.isEmpty()) {
            QMessageBox::warning(this, "Missing Fields", "Please complete your name, email, and feedback message.");
            return;
        }

        FeedbackEntry entry;
        entry.customerName = name;
        entry.email = email;
        entry.rating = 5 - ratingBox->currentIndex();
        entry.message = message;
        entry.submittedAt = QDateTime::currentDateTime().toString("yyyy-MM-dd hh:mm:ss");

        const bool online = submitFeedbackToBackend(entry);
        if (!online) {
            saveFeedback(entry);
            QMessageBox::information(this, "Feedback Saved Locally", "The bakery API was not reachable, so your feedback was saved on this device.");
        } else {
            QMessageBox::information(this, "Feedback Sent", "Thank you for sharing your experience with HoneyMilk.");
        }
        clearForm();
    }

private:
    QLineEdit *nameEdit = nullptr;
    QLineEdit *emailEdit = nullptr;
    QComboBox *ratingBox = nullptr;
    QTextEdit *messageEdit = nullptr;
};

class MainWindow : public QMainWindow {
public:
    MainWindow() {
        setWindowTitle("HoneyMilk Bakery Desktop");
        resize(980, 740);

        auto *appTabs = new QTabWidget(this);
        appTabs->setTabPosition(QTabWidget::North);
        appTabs->setStyleSheet(
            "QTabWidget::pane { border: 1px solid #E9DFD1; background: #FFFDF9; border-radius: 12px; }"
            "QTabBar::tab { background: #F4EEE7; color: #2C221E; padding: 10px 18px; border-top-left-radius: 10px; border-top-right-radius: 10px; }"
            "QTabBar::tab:selected { background: #2C221E; color: white; font-weight: bold; }"
        );

        auto *orderPage = new OrderForm(this);
        auto *feedbackPage = new FeedbackForm(this);
        appTabs->addTab(orderPage, "Place Order");
        appTabs->addTab(feedbackPage, "Customer Feedback");

        setCentralWidget(appTabs);

        setStyleSheet(
            "QWidget { background: #FDFBF7; color: #2C221E; font-family: 'Segoe UI'; }"
            "QGroupBox { border: 1px solid #E9DFD1; background: #FFFDFB; border-radius: 12px; font-weight: bold; margin-top: 10px; padding-top: 14px; }"
            "QLineEdit, QTextEdit, QComboBox, QSpinBox, QDateEdit { background: white; border: 1px solid #E9DFD1; border-radius: 9px; padding: 8px 10px; }"
            "QLabel { color: #2C221E; }"
        );
    }
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    app.setApplicationName("HoneyMilk Bakery Desktop");
    app.setOrganizationName("HoneyMilk");

    MainWindow window;
    window.show();
    return app.exec();
}
