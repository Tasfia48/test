from flask import Flask, render_template, url_for, request, jsonify, flash,redirect, session
import pandas as pd
import numpy as np
import pickle
from io import StringIO
import matplotlib.pyplot as plt
from diversity_viz import *
import base64
from labellines import labelLine, labelLines

app = Flask(__name__)
app.config["SECRET_KEY"] = '80e2229aa326ca04ee982aa63b9b0f13'

DV = DiversityViz()

@app.route("/")
def home():
	'''
	default route, home page
	'''
	return render_template("index.html")

@app.route("/showAll")
def showAll():
	'''
	default route, home page
	'''
	return render_template("showAll.html")

@app.route("/index")
def index():
	'''
	default route, home page
	'''
	return render_template("index.html")
# @app.route("/read_csv", methods=['POST'])
def read_csv():
	'''
	read the csv data to a pandas dataframe
	'''
	# csv_file = request.get_json(force=True);
	df = pd.read_csv("./static/csv/All_beat_data.csv");
	with open("./static/csv/Criminality_dictionary.txt", 'rb') as handle:
		criminality_dictionary=pickle.loads(handle.read())
	# df['index1'] = df.index
	# DV.set_df(df)
	return criminality_dictionary,df
def moving_average(x, w):
	# print(x,w)
	temp = np.convolve(x, np.ones(w), 'valid')/w;
	return temp

@app.route("/get_data",methods=['POST'])
def get_data():
	'''
	get dataframe with the selected features
	accepts the feature names through a ajax request.
	'''
	with open("./static/csv/beat_dictionary.txt", 'rb') as handle:
		beat_dictionary=pickle.loads(handle.read())
	# df['index1'] = df.index
	# DV.set_df(df)
	return jsonify(msg="success",data=beat_dictionary)


@app.route("/get_demographics",methods=['POST'])
def get_demographics():
	'''
	get dataframe with the selected features
	accepts the feature names through a ajax request.
	'''
	with open("./static/csv/demographic.txt", 'rb') as handle:
		demographic=pickle.loads(handle.read())
	# print(demographic)
	# df['index1'] = df.index
	# DV.set_df(df)
	return jsonify(msg="success",data=demographic)



@app.route("/get_beat_demographics",methods=['POST'])
def get_beat_demographics():
	'''
	get dataframe with the selected features
	accepts the feature names through a ajax request.
	'''
	with open("./static/csv/demographic_beat.txt", 'rb') as handle:
		demographic_beat=pickle.loads(handle.read())
	# print(demographic)
	# df['index1'] = df.index
	# DV.set_df(df)
	return jsonify(msg="success",data=demographic_beat)






@app.route('/plot_png',methods=['POST'])
def plot_png():
	req = request.get_json(force=True);
	b1 = int(req["b1"])
	b2 = int(req["b2"])
	district =str(req["district"])
	print(b1)

	d,newDf = read_csv()
	# print(newDf[newDf['BEAT'] == int(b1)])
	newDf['BEAT']=newDf['BEAT'].astype('int64')
	fig = create_figure(d,newDf,b1,b2)

	# output = io.BytesIO()
    # FigureCanvas(fig).print_png(output)

	return jsonify(msg="success",fig=fig)
    # return Response(output.getvalue(), mimetype='image/png')

def zero_division(n, d):
    return n / d if d else 0


def create_figure(d,newDf,b1,b2):
	p1 = newDf[newDf['BEAT'] == int(b1)]['policeCount'].values.tolist()
	print(p1)
	p2 = newDf[newDf['BEAT'] == int(b2)]['policeCount'].values.tolist()
	a = []
	b = []
	c1 = []
	c2 = []
	print(len(p1))
	for i in range(len(p1)):
	  a.append(zero_division(p1[i],(p1[i]+p2[i])))
	  b.append(zero_division(p2[i],(p1[i]+p2[i])))
	  c1.append(zero_division(d[b1][i],(d[b1][i]+d[b2][i])))
	  c2.append(zero_division(d[b2][i],(d[b1][i]+d[b2][i])))

	a_roll= moving_average(a,7)
	b_roll= moving_average(b,7)
	fig=plt.figure(figsize=(6,3))
	p1,=plt.plot(a_roll,label="Policing at Beat " + str(b1))
	p2,=plt.plot(b_roll,label ="Policing at Beat "+str(b2),c="orange")
	z1,=plt.plot(c1,label="Criminality at Beat "+str(b1),linestyle="--",dashes=(5, 5),c="steelblue",linewidth=2)
	z2,=plt.plot(c2,label="Criminality at Beat "+str(b2),linestyle="--",dashes=(5, 5),c="orange",linewidth=2)
	plt.xlabel("Days",fontsize=12)
	plt.ylabel("Level",fontsize=12)
	plt.xticks(fontsize=12 )
	plt.yticks(fontsize=12 )
	# plt.legend(handles=[p1, p2,z1,z2], bbox_to_anchor=(1.05, 1), loc='upper left')
	labelLines(plt.gca().get_lines(),align=False, fontsize=10)
	plt.tight_layout(pad=0.4, w_pad=0.5, h_pad=1.0)
	plt.ylim(-0.1,1.1)
	plt.savefig('./static/images/new_plot.png')
	encoded_string = ""
	with open("./static/images/new_plot.png", "rb") as image_file:
	    encoded_string = base64.b64encode(image_file.read()).decode("ascii")
	return encoded_string


@app.route('/plot_dist_png',methods=['POST'])
def plot_dist_png():
	req = request.get_json(force=True);
	district = req["district"]
	with open("./static/images/District colored"+str(district)+".png", "rb") as image_file:
	    encoded_string = base64.b64encode(image_file.read()).decode("ascii")
	return jsonify(msg="success",fig=encoded_string)



@app.route('/plot_var_tot_png',methods=['GET'])
def plot_var_tot_png():
	with open("./static/images/Violent crime variance in district.png", "rb") as image_file:
	    encoded_string1 = base64.b64encode(image_file.read()).decode("ascii")
	with open("./static/images/Violent crime total in district.png", "rb") as image_file:
	    encoded_string2 = base64.b64encode(image_file.read()).decode("ascii")
	return jsonify(msg="success",fig1=encoded_string1,fig2=encoded_string2)



def create_figure_single(d,newDf,district):
	with open("./static/csv/beat_dictionary.txt", 'rb') as handle:
		beat_dictionary=pickle.loads(handle.read())
	beatList = beat_dictionary[district]

	l = len(d[111])
	total_pol = [0] * l
	total_criminality = [0] * l

	for i in beatList:
		list1 = newDf[newDf['BEAT'] == int(i)]['policeCount'].values.tolist()
		total_pol = [a + b for a, b in zip(total_pol, list1)]
		list2 = d[i]
		total_criminality = [a + b for a, b in zip(total_criminality, list2)]
	# print(total_criminality)
	# print(total_pol)
	all_img_strings = []

	for b in beatList:
		police = []
		criminality = []
		police_roll = []
		p1 = newDf[newDf['BEAT'] == int(b)]['policeCount'].values.tolist()

		for i in range(len(p1)):
			police.append(zero_division(p1[i],total_pol[i]))
			criminality.append(zero_division(d[b][i],total_criminality[i]))
			police_roll= moving_average(police,7)

		fig=plt.figure(figsize=(5,3))
		plt.plot(police_roll,label="Policing at Beat " + str(b))
		plt.plot(criminality,label="Criminality at Beat "+str(b),linestyle="--",dashes=(5, 5),linewidth=2)
		plt.xlabel("Days",fontsize=10)
		plt.ylabel("Level",fontsize=10)
		plt.xticks(fontsize=10)
		plt.yticks(fontsize=10)
		plt.legend(loc="upper left")
		
		# labelLines(plt.gca().get_lines(),align=False, fontsize=10)
		plt.tight_layout(pad=0.4, w_pad=0.5, h_pad=1.0)
		plt.ylim(-0.1,1.1)
		plt.savefig('./static/images/img'+str(b)+'.png')
		encoded_string = ""
		with open("./static/images/img"+str(b)+".png", "rb") as image_file:
		    encoded_string = base64.b64encode(image_file.read()).decode("ascii")
		all_img_strings.append(encoded_string)
	return all_img_strings


@app.route('/plot_beat_single_png',methods=['POST'])
def plot_beat_single_png():
	req = request.get_json(force=True);
	district = req["district"]
	d,newDf = read_csv()
	figures=create_figure_single(d,newDf,district)
	print(figures)
	print(len(figures))
	return jsonify(msg="success",fig=figures)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
